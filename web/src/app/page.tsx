import ClientRoot from "@/components/ClientRoot";

export default function Page() {
  return (
    <div className="shell">
      <div className="topbar">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="title">Cashflow Steps</div>
          <div className="badge">🎲 ソロ / 初心者向け / 30分目安</div>
        </div>
        <div className="badge">ヒント：カードをクリック / ボタンで進行</div>
      </div>

      <div className="frame">
        <div className="panel">
          <ClientRoot />
        </div>
      </div>

      <div className="footer">
        本作はオリジナルの金融教育ゲームです（特定の既存ボードゲームの複製ではありません）。
      </div>
    </div>
  );
}

