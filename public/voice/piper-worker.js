/*
 * lifeZoi natural voice: Piper text-to-speech running inside this browser.
 *
 * The text to read never leaves the device. This worker only downloads files:
 * the speech engine (ONNX Runtime Web, MIT) and the pronunciation rules
 * (piper-phonemize with eSpeak NG data, GPL-3.0) from cdn.jsdelivr.net, and
 * the voice model the person chose from huggingface.co. Downloads are kept in
 * this browser's Cache Storage so they happen once.
 *
 * The page talks to this worker with messages: see src/lib/voice/neural/client.ts.
 */
/* eslint-disable */
"use strict";

var CACHE = "lifezoi-natural-voice-v1";
var ORT_BASE = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
var PHONEMIZE_BASE = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/";
var PHONEMIZE_FILES = [PHONEMIZE_BASE + "piper_phonemize.wasm", PHONEMIZE_BASE + "piper_phonemize.data"];

var engine = null; // Promise of { ort, createPhonemize, wasm, data }
var sessions = new Map(); // voice key -> Promise of { session, config }

function reply(id, body, transfer) {
  self.postMessage(Object.assign({ id: id }, body), transfer || []);
}

async function cached(url) {
  var cache = await caches.open(CACHE);
  return cache.match(url);
}

/** Downloads `url` into the cache unless it is there, reporting bytes as they arrive. */
async function fetchToCache(url, onBytes) {
  var cache = await caches.open(CACHE);
  var hit = await cache.match(url);
  if (hit) {
    var size = Number(hit.headers.get("Content-Length") || 0);
    if (onBytes) onBytes(size, size);
    return hit;
  }
  var response = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!response.ok) throw new Error("download-failed");
  var total = Number(response.headers.get("Content-Length") || 0);
  var reader = response.body && response.body.getReader();
  var chunks = [];
  var loaded = 0;
  if (reader) {
    for (;;) {
      var step = await reader.read();
      if (step.done) break;
      chunks.push(step.value);
      loaded += step.value.length;
      if (onBytes) onBytes(loaded, total);
    }
  } else {
    var whole = new Uint8Array(await response.arrayBuffer());
    chunks.push(whole);
    loaded = whole.length;
  }
  var blob = new Blob(chunks);
  var stored = new Response(blob, { headers: { "Content-Length": String(blob.size) } });
  await cache.put(url, stored.clone());
  return stored;
}

function loadEngine() {
  if (engine) return engine;
  engine = (async function () {
    importScripts(ORT_BASE + "ort.wasm.min.js");
    importScripts(PHONEMIZE_BASE + "piper_phonemize.js");
    var ort = self.ort;
    // One thread: several threads need a cross-origin isolated page, which lifeZoi is not.
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.wasmPaths = ORT_BASE;
    var wasm = await (await fetchToCache(PHONEMIZE_FILES[0])).arrayBuffer();
    var data = await (await fetchToCache(PHONEMIZE_FILES[1])).arrayBuffer();
    return { ort: ort, createPhonemize: self.createPiperPhonemize, wasm: wasm, data: data };
  })();
  engine.catch(function () {
    engine = null;
  });
  return engine;
}

function loadVoice(voice) {
  var known = sessions.get(voice.key);
  if (known) return known;
  var loading = (async function () {
    var parts = await loadEngine();
    var config = await (await fetchToCache(voice.config)).json();
    var model = await (await fetchToCache(voice.model)).arrayBuffer();
    var session = await parts.ort.InferenceSession.create(model, { executionProviders: ["wasm"] });
    return { session: session, config: config };
  })();
  loading.catch(function () {
    sessions.delete(voice.key);
  });
  // Keep at most two voices in memory: phones have little to spare.
  if (sessions.size >= 2) sessions.delete(sessions.keys().next().value);
  sessions.set(voice.key, loading);
  return loading;
}

function phonemeIds(parts, text, espeakVoice) {
  return new Promise(function (resolve, reject) {
    parts
      .createPhonemize({
        print: function (line) {
          try {
            resolve(JSON.parse(line).phoneme_ids);
          } catch (error) {
            reject(error);
          }
        },
        printErr: function () {},
        wasmBinary: parts.wasm,
        // The pronunciation data is already in memory; a copy keeps the original usable next time.
        getPreloadedPackage: function () {
          return parts.data.slice(0);
        },
        locateFile: function (name) {
          return PHONEMIZE_BASE + name;
        },
      })
      .then(function (module) {
        module.callMain(["-l", espeakVoice, "--input", JSON.stringify([{ text: text }]), "--espeak_data", "/espeak-ng-data"]);
      }, reject);
  });
}

async function speak(voice, text, lengthScale) {
  var parts = await loadEngine();
  var loaded = await loadVoice(voice);
  var config = loaded.config;
  var ids = await phonemeIds(parts, text, config.espeak.voice);
  if (!ids || ids.length === 0) throw new Error("no-phonemes");
  var ort = parts.ort;
  var inference = config.inference || {};
  var feeds = {
    input: new ort.Tensor("int64", BigInt64Array.from(ids.map(BigInt)), [1, ids.length]),
    input_lengths: new ort.Tensor("int64", BigInt64Array.from([BigInt(ids.length)]), [1]),
    scales: new ort.Tensor("float32", Float32Array.from([inference.noise_scale || 0.667, (inference.length_scale || 1) * lengthScale, inference.noise_w || 0.8]), [3]),
  };
  if (config.num_speakers > 1) feeds.sid = new ort.Tensor("int64", BigInt64Array.from([BigInt(voice.speaker || 0)]), [1]);
  var result = await loaded.session.run(feeds);
  var pcm = new Float32Array(result.output.data);
  return { pcm: pcm, sampleRate: config.audio.sample_rate };
}

self.onmessage = async function (event) {
  var message = event.data || {};
  var id = message.id;
  try {
    if (message.type === "status") {
      var installed = [];
      for (var voice of message.voices) {
        var model = await cached(voice.model);
        var config = await cached(voice.config);
        if (model && config) installed.push(voice.key);
      }
      reply(id, { ok: true, installed: installed });
    } else if (message.type === "install") {
      var target = message.voice;
      var sizes = {};
      var report = function (url) {
        return function (loaded, total) {
          sizes[url] = { loaded: loaded, total: total };
          var sum = { loaded: 0, total: 0 };
          for (var key in sizes) {
            sum.loaded += sizes[key].loaded;
            sum.total += sizes[key].total;
          }
          reply(id, { progress: { loaded: sum.loaded, total: Math.max(sum.total, message.expectedBytes || 0) } });
        };
      };
      await fetchToCache(PHONEMIZE_FILES[0], report(PHONEMIZE_FILES[0]));
      await fetchToCache(PHONEMIZE_FILES[1], report(PHONEMIZE_FILES[1]));
      await fetchToCache(target.config, report(target.config));
      await fetchToCache(target.model, report(target.model));
      // Prove it works before saying it is ready.
      await speak(target, message.sample || "Hello.", 1);
      reply(id, { ok: true });
    } else if (message.type === "remove") {
      var cache = await caches.open(CACHE);
      await cache.delete(message.voice.model);
      await cache.delete(message.voice.config);
      sessions.delete(message.voice.key);
      reply(id, { ok: true });
    } else if (message.type === "speak") {
      var out = await speak(message.voice, message.text, message.lengthScale || 1);
      reply(id, { ok: true, pcm: out.pcm, sampleRate: out.sampleRate }, [out.pcm.buffer]);
    } else {
      reply(id, { ok: false, error: "unknown" });
    }
  } catch (error) {
    reply(id, { ok: false, error: String((error && error.message) || error) });
  }
};
