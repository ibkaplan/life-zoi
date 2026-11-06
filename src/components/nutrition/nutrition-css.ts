export const nutritionCss = `
.nz-wrap {
  display: grid;
  gap: 1.25rem;
  font-size: 1.2rem;
  line-height: 1.6;
}

.nz-wrap h2 {
  font-size: clamp(1.85rem, 3vw, 2.5rem);
}

.nz-wrap h3 {
  font-size: 1.45rem;
}

.nz-studio {
  display: grid;
  gap: 1.25rem;
}

.nz-split {
  display: grid;
  gap: 0.9rem;
  align-items: start;
}

.nz-plate {
  margin: 0;
  width: min(100%, 26rem);
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  border: 8px solid #ffffff;
  background: #ffffff;
  justify-self: center;
}

.nz-wedge {
  margin: 0;
  padding: 1rem;
  overflow: hidden;
  color: #172554;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.nz-wedge h3 {
  font-size: 1.05rem;
}

.nz-wedge ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.nz-wedge li {
  font-size: 1.05rem;
  line-height: 1.3;
}

.nz-wedgeProduce {
  grid-row: 1 / span 2;
  background: #dceeff;
  padding-left: 1.6rem;
}

.nz-wedgeProtein {
  background: #e9ddfb;
  padding-right: 0.7rem;
  padding-bottom: 0.4rem;
}

.nz-wedgeGrain {
  background: #f7f8ff;
  padding-right: 0.7rem;
  padding-top: 0.4rem;
}

.nz-pick {
  text-align: left;
  display: grid;
  gap: 0.15rem;
  min-height: 48px;
  border-radius: 16px;
  border: 1px solid #e9ddfb;
  background: #ffffff;
  color: #172554;
  padding: 0.75rem 0.9rem;
  font: inherit;
  font-size: 1.05rem;
}

.nz-pick[aria-pressed="true"] {
  background: #e9ddfb;
  border-color: #7136c8;
}

.nz-checkList,
.nz-steps {
  display: grid;
  gap: 0.7rem;
}

.nz-checkList {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nz-draw {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 16px;
}

.nz-panel {
  display: grid;
  gap: 0.85rem;
  background: linear-gradient(165deg, #e9ddfb 0%, #ffffff 48%, #dceeff 100%);
  border: 1px solid #e9ddfb;
  border-radius: 18px;
  box-shadow: 0 10px 28px rgba(23, 37, 84, 0.05);
  padding: 1.15rem;
  color: #172554;
}

.nz-panel h2,
.nz-panel h3 {
  color: #5725a8;
}

.nz-kicker {
  margin: 0;
  color: #7136c8;
  font-size: 0.86rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nz-jumps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nz-jumps a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid #e9ddfb;
  background: #ffffff;
  color: #5725a8;
  text-decoration: none;
  font-weight: 700;
}

.nz-grid {
  display: grid;
  gap: 0.9rem;
}

.nz-photoFrame {
  margin: 0;
  border-radius: 16px;
  overflow: hidden;
  background: #e9ddfb;
  aspect-ratio: 4 / 3;
}

.nz-photoFrame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nz-cardTitle {
  color: #5725a8;
}

.nz-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.nz-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0.15rem 0.65rem;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #dceeff;
  color: #172554;
  font-weight: 700;
}

.nz-compare {
  display: grid;
  gap: 0.8rem;
}

.nz-table {
  width: 100%;
  border-collapse: collapse;
}

.nz-table th,
.nz-table td {
  text-align: left;
  padding: 0.65rem 0.4rem;
  border-bottom: 1px solid #e9ddfb;
  vertical-align: top;
}

.nz-flow {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: 0;
}

.nz-flowStep {
  margin: 0;
  background: #ffffff;
  border: 1px solid #e9ddfb;
  border-radius: 16px;
  padding: 0.9rem 1rem;
  font-weight: 750;
  color: #172554;
}

.nz-then {
  margin: 0;
  text-align: center;
  color: #7136c8;
  font-weight: 750;
}

.nz-names {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nz-names li {
  background: #ffffff;
  border: 1px solid #dceeff;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
}

.nz-labelSheet {
  max-width: 22rem;
  margin: 0;
  background: #ffffff;
  color: #172554;
  border: 3px solid #172554;
  padding: 0.8rem 0.9rem 1rem;
  display: grid;
  gap: 0.35rem;
}

.nz-labelSheet p,
.nz-labelSheet figcaption {
  margin: 0;
}

.nz-labelProduct {
  font-weight: 750;
  font-size: 1.15rem;
  border-bottom: 8px solid #172554;
  padding-bottom: 0.25rem;
}

.nz-labelRow,
.nz-labelAdded {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid #172554;
  padding: 0.3rem 0;
}

.nz-labelAdded {
  background: #e9ddfb;
  border: 2px solid #7136c8;
  padding: 0.4rem;
  font-weight: 750;
}

.nz-choices {
  display: grid;
  gap: 0.45rem;
}

.nz-choice {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  min-height: 44px;
  padding: 0.55rem 0.7rem;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e9ddfb;
}

.nz-choice input {
  margin-top: 0.25rem;
}

.nz-good {
  border-color: #4295e8;
  background: #dceeff;
}

.nz-miss {
  border-color: #8a2f28;
}

.nz-sketch {
  width: 100%;
  height: auto;
  border-radius: 18px;
}

.nz-fold {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e9ddfb;
  padding: 0.4rem 0.9rem 0.8rem;
}

.nz-fold summary {
  cursor: pointer;
  font-weight: 750;
  min-height: 44px;
  display: flex;
  align-items: center;
  color: #5725a8;
}

.nz-day {
  width: 100%;
  text-align: left;
  display: grid;
  gap: 0.25rem;
  min-height: 44px;
  border-radius: 16px;
  border: 1px solid #e9ddfb;
  background: #ffffff;
  color: #172554;
  padding: 0.8rem 0.9rem;
  font: inherit;
}

.nz-day[aria-pressed="true"] {
  background: #e9ddfb;
  border-color: #7136c8;
}

.nz-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.nz-sources {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.35rem;
}

.nz-sources a {
  overflow-wrap: anywhere;
}

.nz-note {
  color: #3e4e80;
}

@media (min-width: 720px) {
  .nz-grid.nz-two,
  .nz-compare,
  .nz-split {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 980px) {
  .nz-grid.nz-three {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .nz-flow {
    flex-direction: row;
    align-items: stretch;
  }

  .nz-flowStep {
    flex: 1;
  }

  .nz-then {
    align-self: center;
  }
}

@media print {
  body.nutrition-printing .learn:not(.nz-wrap) > *:not(.nz-wrap),
  body.nutrition-printing .nz-studio > *:not(.nz-printing),
  body.nutrition-printing .nz-studio ~ * {
    display: none !important;
  }

  body.nutrition-printing .topbar,
  body.nutrition-printing .bottom-nav,
  body.nutrition-printing .footer-note,
  body.nutrition-printing .banner,
  body.nutrition-printing .menu-button {
    display: none !important;
  }

  body.nutrition-printing .app-main {
    padding-bottom: 0 !important;
  }

  .nz-noPrint {
    display: none !important;
  }

  .nz-panel {
    box-shadow: none;
    background: #ffffff;
  }
}
`;
