/** Limits for Reviews & Feedback. Kept in one place so the tests and the UI agree. */
export const REVIEW_TEXT_MAX = 1_000;
export const REVIEW_THOUGHTS_MAX = 2_000;
export const SUGGESTION_TITLE_MAX = 120;
export const SUGGESTION_DETAILS_MAX = 2_000;
export const DISPLAY_NAME_MAX = 30;
export const ADMIN_NOTE_MAX = 2_000;
export const THEME_MAX = 60;
export const ANNOUNCEMENT_TITLE_MAX = 120;
export const ANNOUNCEMENT_DESCRIPTION_MAX = 1_200;
export const ANNOUNCEMENT_CATEGORY_MAX = 60;

/** One review per member in this many days. A second one inside the window is refused as a duplicate. */
export const REVIEW_COOLDOWN_DAYS = 30;
/** At most this many suggestions per member in 24 hours. */
export const SUGGESTIONS_PER_DAY = 10;
/** The same suggestion text from the same member inside this window is a duplicate. */
export const DUPLICATE_SUGGESTION_DAYS = 30;
/** Published reviews returned to members, newest first. */
export const PUBLIC_REVIEW_LIMIT = 60;

/** Review invitation on the Dashboard. Stored in this browser only. */
export const INVITE_AFTER_DAYS = 5;
export const INVITE_AFTER_VISIT_DAYS = 3;
export const INVITE_SNOOZE_DAYS = 30;
/** After this many "Maybe later" answers the invitation is not shown again. */
export const INVITE_MAX_DISMISSALS = 2;
