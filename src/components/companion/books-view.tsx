"use client";

import { useEffect, useRef, useState } from "react";
import { Art } from "@/components/companion/art";
import { useLocale } from "@/components/locale-provider";
import { LOCALE_META } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
import { FavoriteButton, SaveNote } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { commitCompanion } from "@/lib/companion/store";
import { addRecent, withDay, type CompanionState } from "@/lib/companion/state";
import { BOOKS, bookById, PUBLIC_DOMAIN_LIBRARIES, type Book } from "@/lib/companion/books";
import { localISODate } from "@/lib/dates";

function savePage(state: CompanionState, book: Book, page: number): CompanionState {
  const key = `book:${book.id}`;
  const furthest = state.media.positions[`${key}:max`] ?? -1;
  const counted = page > furthest ? withDay(state, localISODate(), (day) => ({ ...day, readingPages: day.readingPages + (page - Math.max(furthest, 0)) })) : state;
  return {
    ...counted,
    media: {
      ...counted.media,
      positions: { ...counted.media.positions, [key]: page, [`${key}:max`]: Math.max(furthest, page) },
    },
  };
}

export function Reader({ book, onClose }: { book: Book; onClose?: () => void }) {
  const { t, locale } = useLocale();
  const { companion, sample } = useProfile();
  const key = `book:${book.id}`;
  const start = Math.min(book.pages.length - 1, companion.media.positions[key] ?? 0);
  const [page, setPage] = useState(start);
  const [speaking, setSpeaking] = useState(false);
  const spokeSince = useRef<number | null>(null);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const bookmarks = companion.media.bookmarks[key] ?? [];
  const paragraphs = (book.pages[page] ?? []).map((text) => t(text));

  function commit(change: (state: CompanionState) => CompanionState) {
    if (!sample) commitCompanion(change);
  }

  function stopSpeaking() {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    if (spokeSince.current !== null) {
      const minutes = Math.round((Date.now() - spokeSince.current) / 60000);
      spokeSince.current = null;
      if (minutes > 0) commit((state) => withDay(state, localISODate(), (day) => ({ ...day, listeningMinutes: day.listeningMinutes + minutes })));
    }
  }

  function go(next: number) {
    stopSpeaking();
    const clamped = Math.max(0, Math.min(book.pages.length - 1, next));
    setPage(clamped);
    commit((state) => savePage(state, book, clamped));
  }

  function listen() {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(paragraphs.join(" "));
    utterance.lang = LOCALE_META[locale].htmlLang;
    utterance.rate = 0.9;
    utterance.onend = () => {
      stopSpeaking();
    };
    spokeSince.current = Date.now();
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    if (!sample) commitCompanion((state) => addRecent(savePage(state, book, start), key, new Date().toISOString()));
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const marked = bookmarks.includes(page);
  return (
    <article className="lz-reader stack" aria-label={t(book.title)}>
      {onClose ? (
        <div className="lz-buttons">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
          >
            {t("Back to all books")}
          </button>
        </div>
      ) : null}
      <h2>{t(book.title)}</h2>
      <p className="hint">
        {t("Page {page} of {total}", { page: page + 1, total: book.pages.length })} · {t(book.credit)}
      </p>
      {paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
      <div className="lz-buttons">
        <button className="btn btn-secondary" type="button" onClick={() => go(page - 1)} disabled={page === 0}>
          {t("Previous page")}
        </button>
        <button className="btn btn-primary" type="button" onClick={() => go(page + 1)} disabled={page >= book.pages.length - 1}>
          {t("Next page")}
        </button>
        {canSpeak ? (
          speaking ? (
            <button className="btn btn-teal" type="button" onClick={stopSpeaking}>
              {t("Stop listening")}
            </button>
          ) : (
            <button className="btn btn-teal" type="button" onClick={listen}>
              {t("Listen to this page")}
            </button>
          )
        ) : null}
        <button
          className="btn btn-ghost"
          type="button"
          aria-pressed={marked}
          onClick={() =>
            commit((state) => {
              const list = state.media.bookmarks[key] ?? [];
              const next = list.includes(page) ? list.filter((item) => item !== page) : [...list, page].sort((a, b) => a - b);
              return { ...state, media: { ...state.media, bookmarks: { ...state.media.bookmarks, [key]: next } } };
            })
          }
        >
          {marked ? t("Remove bookmark") : t("Bookmark this page")}
        </button>
        <FavoriteButton id={key} label={msg("this book")} />
      </div>
      {!canSpeak ? <p className="hint">{t("This browser cannot read aloud, so listening is not available here.")}</p> : null}
      {canSpeak ? <p className="hint">{t("Listening uses your device's built-in voice. The words stay on your device.")}</p> : null}
      {bookmarks.length > 0 ? (
        <p>
          {t("Bookmarks:")}{" "}
          {bookmarks.map((mark) => (
            <button key={mark} className="btn btn-ghost" type="button" onClick={() => go(mark)}>
              {t("Page {page}", { page: mark + 1 })}
            </button>
          ))}
        </p>
      ) : null}
    </article>
  );
}

export function BooksView() {
  const { t } = useLocale();
  const { ready, companion } = useProfile();
  const [open, setOpen] = useState<string | null>(null);
  if (!ready) return <p className="hint">{t("Loading books…")}</p>;
  const book = open ? bookById(open) : null;
  const today = companion.days[localISODate()];
  return (
    <div className="stack-lg">
      <div className="lz-hero-row">
        <div className="lz-hello">
          <p className="kicker">
            {t("Health Library")} · {t("Books")}
          </p>
          <h1>{t("Books and listening")}</h1>
          <p className="script brand-line">{t("A few quiet pages a day.")}</p>
          <p>{t("Short stories and gentle guides written for LifeZoi. Read them here, or listen with your device's voice. LifeZoi remembers your page.")}</p>
        </div>
        <Art name="book" />
      </div>
      <SaveNote />
      {today && (today.readingPages || today.listeningMinutes) ? (
        <p className="alert alert-ok">
          {t("Today: {pages} pages read · {minutes} minutes listened.", { pages: today.readingPages, minutes: today.listeningMinutes })}
        </p>
      ) : null}
      {book ? (
        <section className="card">
          <Reader key={book.id} book={book} onClose={() => setOpen(null)} />
        </section>
      ) : (
        <div className="lz-grid">
          {BOOKS.map((item) => {
            const key = `book:${item.id}`;
            const at = companion.media.positions[key];
            const favorite = companion.media.favorites.includes(key);
            return (
              <article key={item.id} className="lz-card stack">
                <p className="kicker">{item.kind === "story" ? t("Short story") : t("Gentle guide")}</p>
                <h2>{t(item.title)}</h2>
                <p>{t(item.summary)}</p>
                <p className="hint">
                  {t("{count} pages", { count: item.pages.length })}
                  {at !== undefined ? ` · ${t("you are on page {page}", { page: at + 1 })}` : ""}
                  {favorite ? ` · ${t("favorite")}` : ""}
                </p>
                <button className="btn btn-primary" type="button" onClick={() => setOpen(item.id)}>
                  {at !== undefined && at > 0 ? t("Continue reading") : t("Start reading")}
                </button>
              </article>
            );
          })}
        </div>
      )}
      <section className="card stack">
        <h2>{t("More free books")}</h2>
        <p>{t("These libraries offer public-domain books and audiobooks. They are separate websites and open in a new tab.")}</p>
        <ul>
          {PUBLIC_DOMAIN_LIBRARIES.map((library) => (
            <li key={library.name}>
              <a href={library.url} target="_blank" rel="noopener noreferrer">
                {library.name}
              </a>
              : {t(library.note)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
