import type { RebusLayout, RebusPiece } from "@/lib/brain-quiz/activities";
import { Icon } from "@/components/brain-quiz/icons";
import { useT } from "@/components/locale-provider";

function Piece({ piece }: { piece: RebusPiece }) {
  if (piece.type === "rule") return <span className={"quiz-rule"} />;
  if (piece.type === "icon") return <Icon name={piece.icon} />;
  const scale = piece.scale === "sm" ? "quiz-sm" : piece.scale === "lg" ? "quiz-lg" : "quiz-md";
  return <p className={`quiz-word ${scale}`}>{piece.text}</p>;
}

export function RebusArt({ layout }: { layout: RebusLayout }) {
  const t = useT();
  if (layout.arrangement === "between") {
    return (
      <div className={"quiz-rebus"} aria-label={t("Picture puzzle with a word between two lines")}>
        <div className={"quiz-between"}>
          <span className={"quiz-rule"} />
          <p className={`quiz-word quiz-lg`}>{layout.text}</p>
          <span className={"quiz-rule"} />
        </div>
      </div>
    );
  }
  if (layout.arrangement === "frame") {
    return (
      <div className={"quiz-rebus"}>
        <div className={"quiz-frame"}>
          <span>{layout.frame}</span>
          <p className={`quiz-word quiz-lg`}>{layout.inner}</p>
        </div>
      </div>
    );
  }
  if (layout.arrangement === "repeat") {
    return (
      <div className={"quiz-rebus"}>
        <div className={"quiz-repeat"}>
          {Array.from({ length: layout.count }, (_, index) => (
            <p key={index} className={`quiz-word quiz-md`}>{layout.text}</p>
          ))}
        </div>
      </div>
    );
  }
  if (layout.arrangement === "flip") {
    return (
      <div className={"quiz-rebus"}>
        <p className={`quiz-word quiz-lg quiz-flip`}>{layout.text}</p>
      </div>
    );
  }
  const className = layout.arrangement === "stack" ? "quiz-stack" : "quiz-row";
  return (
    <div className={"quiz-rebus"}>
      <div className={className}>
        {layout.pieces.map((piece, index) => <Piece key={index} piece={piece} />)}
      </div>
    </div>
  );
}
