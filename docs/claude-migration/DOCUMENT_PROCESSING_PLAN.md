# Future document processing plan

This plan is not implemented. The lab screen accepts no file, stores no document, and does not send a personal result to MedlinePlus or an AI provider.

## What would have to exist first

1. A real account, not only a browser tab. Assessment accounts now exist. They do not by themselves authorize a document upload. The lab screen still accepts no file.
2. Explicit consent that names what is uploaded, who can see it, and how long it is kept.
3. Encryption in transit and at rest, with keys the application server does not put in browser code.
4. Access control so one person cannot read another person's file.
5. A retention limit and a deletion path that removes the file and derived text.
6. A privacy notice that matches that system, plus the existing indexing review before a public launch.
7. A separate approval before any paid AI model is allowed to read a document.

## Processing shape, after that approval

- The browser would send the file only to lifeZoi's own server.
- The server would validate type and size, reject unexpected content, and store the object outside the app repository.
- Extracted text would be treated as health information. It would not be written into logs by application code.
- A later model call, if approved, would use the minimum text needed and would still refuse diagnosis, medication changes, and lifespan claims.
- MedlinePlus would still receive only a verified LOINC code, never the uploaded file or the person's name.

Until those controls are reviewed, the only lab experience is the labeled synthetic report.
