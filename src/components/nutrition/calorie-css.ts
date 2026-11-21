/** Styles for the calorie counter. Uses the Nutrition palette from nutrition-css.ts. */
export const calorieCss = `
.cc { min-width: 0; }
.cc h3 { margin: 0; }
.cc-muted { color: #3e4e80; font-size: 0.98rem; }
.cc-label { margin: 0; color: #5725a8; font-weight: 700; font-size: 1rem; }
.cc-warn {
  margin: 0;
  padding: 0.7rem 0.85rem;
  border-radius: 12px;
  background: #fff7e0;
  border: 1px solid #f1d58a;
  color: #4a3500;
  font-size: 0.98rem;
}
.cc input:not([type="checkbox"]):not([type="file"]),
.cc select {
  min-height: 48px;
  border: 1.5px solid #b9a3e3;
  border-radius: 12px;
  background: #ffffff;
  color: #172554;
  padding: 0.5rem 0.75rem;
  font: inherit;
  font-size: 1.05rem;
}
.cc input:focus-visible, .cc select:focus-visible { outline: 3px solid #7136c8; outline-offset: 1px; }
.cc-hidden { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.cc-dayBar { display: flex; align-items: center; gap: 0.6rem; }
.cc-dayBar .btn { min-width: 48px; min-height: 48px; font-size: 1.4rem; padding: 0 0.8rem; }
.cc-day { flex: 1; margin: 0; text-align: center; overflow-wrap: anywhere; }
.cc-total {
  display: grid;
  gap: 0.25rem;
  background: #ffffff;
  border: 2px solid #7136c8;
  border-radius: 18px;
  padding: 1rem 1.1rem;
}
.cc-total p { margin: 0; }
.cc-totalKcal { font-size: clamp(2rem, 6vw, 2.6rem); font-weight: 800; color: #172554; line-height: 1.1; }
.cc-macros { display: flex; flex-wrap: wrap; gap: 0.35rem 1rem; color: #172554; font-size: 1rem; }
.cc-meals { border: 0; margin: 0; padding: 0; display: grid; gap: 0.5rem; min-width: 0; }
.cc-mealButtons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
.cc-mealPick { text-align: center; justify-items: center; font-weight: 650; }
.cc-addArea { display: grid; gap: 1rem; min-width: 0; }
.cc-box {
  background: #ffffff;
  border: 1px solid #e9ddfb;
  border-radius: 16px;
  padding: 1rem;
  min-width: 0;
}
.cc-searchRow { display: grid; gap: 0.6rem; align-items: end; }
.cc-searchRow input { width: 100%; }
.cc-results, .cc-items, .cc-guesses { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
.cc-result {
  width: 100%;
  min-height: 48px;
  display: grid;
  gap: 0.1rem;
  text-align: left;
  font: inherit;
  font-size: 1.02rem;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  border: 1px solid #e9ddfb;
  background: #faf7ff;
  color: #172554;
  cursor: pointer;
}
.cc-result:hover, .cc-result:focus-visible { border-color: #7136c8; background: #f1e9fd; }
.cc-resultName { overflow-wrap: anywhere; }
.cc-add { display: grid; gap: 0.5rem; padding: 0.9rem; border-radius: 14px; border: 2px solid #7136c8; background: #faf7ff; }
.cc-add p { margin: 0; }
.cc-addName { overflow-wrap: anywhere; }
.cc-preview { display: grid; gap: 0.2rem; }
.cc-photo { width: 100%; max-width: 22rem; height: auto; border-radius: 14px; display: block; }
.cc-guess { display: grid; gap: 0.5rem; padding: 0.75rem; border-radius: 12px; border: 1px solid #e9ddfb; background: #faf7ff; }
.cc-guess p { margin: 0; }
.cc-check { display: flex; gap: 0.6rem; align-items: flex-start; overflow-wrap: anywhere; }
.cc-check input { width: 24px; height: 24px; margin-top: 0.2rem; flex: none; }
.cc-gramsField input { max-width: 9rem; }
.cc-empty { margin: 0; color: #3e4e80; }
.cc-mealBlock { display: grid; gap: 0.5rem; background: #ffffff; border: 1px solid #e9ddfb; border-radius: 16px; padding: 1rem; }
.cc-mealHead { display: flex; justify-content: space-between; align-items: baseline; gap: 0.6rem; flex-wrap: wrap; }
.cc-mealHead p { margin: 0; }
.cc-item { display: grid; gap: 0.4rem; padding: 0.75rem 0 0.25rem; border-top: 1px solid #ede6f8; }
.cc-itemHead { display: flex; justify-content: space-between; gap: 0.6rem; align-items: baseline; }
.cc-itemHead p { margin: 0; }
.cc-itemName { overflow-wrap: anywhere; min-width: 0; }
.cc-itemKcal { white-space: nowrap; font-weight: 700; }
.cc-pill { margin-left: 0.5rem; display: inline-block; vertical-align: middle; }
.cc-itemEdit { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0.5rem; align-items: end; }
.cc-itemEdit .field input, .cc-itemEdit .field select { width: 100%; }
.cc-delete { grid-column: 1 / -1; }
@media (hover: hover) and (pointer: fine) {
  .cc-camera { display: none; }
}
@media (min-width: 720px) {
  .cc-mealButtons { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .cc-searchRow { grid-template-columns: minmax(0, 1fr) auto; }
  .cc-itemEdit { grid-template-columns: 9rem 12rem auto; justify-content: start; }
  .cc-delete { grid-column: auto; }
}
@media (min-width: 980px) {
  .cc-addArea { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); align-items: start; }
}
`;
