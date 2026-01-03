import json
from dataclasses import asdict

import streamlit as st

from game.data_loader import load_events, load_offers, load_roles
from game.engine import (
    GameState,
    apply_event,
    can_afford_offer,
    check_win,
    draw_cards,
    new_game,
    process_month_start,
    purchase_offer,
    summarize_state,
)


st.set_page_config(page_title="Cashflow Steps", page_icon="🎲", layout="wide")


def _inject_css() -> None:
    st.markdown(
        """
<style>
  /* Hide Streamlit chrome */
  #MainMenu { visibility: hidden; }
  footer { visibility: hidden; }
  header { visibility: hidden; }

  /* App background */
  .stApp {
    background:
      radial-gradient(1200px 600px at 10% 10%, rgba(124,58,237,.25), transparent 60%),
      radial-gradient(900px 500px at 90% 20%, rgba(16,185,129,.15), transparent 55%),
      radial-gradient(900px 700px at 60% 95%, rgba(59,130,246,.12), transparent 60%),
      linear-gradient(180deg, #0B1220 0%, #070A12 100%);
  }

  /* Headline badge */
  .cfs-badge {
    display: inline-block;
    padding: 6px 10px;
    border: 1px solid rgba(229,231,235,.14);
    border-radius: 999px;
    background: rgba(17,27,46,.55);
    color: rgba(229,231,235,.92);
    font-size: 12px;
    letter-spacing: .02em;
  }

  /* Card-ish containers */
  div[data-testid="stVerticalBlockBorderWrapper"] {
    border-radius: 16px !important;
    border: 1px solid rgba(229,231,235,.10) !important;
    background: rgba(17,27,46,.45) !important;
    box-shadow: 0 10px 24px rgba(0,0,0,.25) !important;
  }

  /* Metrics look like HUD */
  div[data-testid="stMetric"] {
    padding: 14px 14px 10px 14px;
    border-radius: 16px;
    border: 1px solid rgba(229,231,235,.10);
    background: rgba(17,27,46,.55);
  }
  div[data-testid="stMetricLabel"] > div { opacity: .85; }

  /* Buttons */
  .stButton > button {
    border-radius: 14px !important;
    border: 1px solid rgba(229,231,235,.12) !important;
    box-shadow: 0 8px 18px rgba(0,0,0,.18) !important;
  }
  .stButton > button[kind="primary"]{
    border: none !important;
  }
</style>
""",
        unsafe_allow_html=True,
    )


def _init_state() -> None:
    if "game" not in st.session_state:
        st.session_state.game = None
    if "roles" not in st.session_state:
        st.session_state.roles = load_roles("data/roles.json")
    if "offers" not in st.session_state:
        st.session_state.offers = load_offers("data/offers.json")
    if "events" not in st.session_state:
        st.session_state.events = load_events("data/events.json")


def _reset_game(role_id: str, seed: int | None) -> None:
    st.session_state.game = new_game(
        roles=st.session_state.roles,
        role_id=role_id,
        offers=st.session_state.offers,
        events=st.session_state.events,
        seed=seed,
    )


def _download_save(game: GameState) -> None:
    payload = json.dumps(asdict(game), ensure_ascii=False, indent=2)
    st.download_button(
        label="セーブデータをダウンロード（JSON）",
        data=payload.encode("utf-8"),
        file_name="cashflow_steps_save.json",
        mime="application/json",
        use_container_width=True,
    )


_init_state()
_inject_css()

st.markdown(
    """
<div style="display:flex; gap:10px; align-items:center; margin-bottom:6px;">
  <div style="font-size:28px; font-weight:800;">Cashflow Steps</div>
  <div class="cfs-badge">初心者向け / ソロ / 30分目安</div>
</div>
""",
    unsafe_allow_html=True,
)
st.caption("毎月：収入/支出 → イベント → オファー購入。目標は「パッシブ収入 ≥ 固定費」。")

with st.expander("遊び方（MVP）", expanded=False):
    st.markdown(
        """
- **開始**：職業を選んでゲーム開始
- **月の開始**：給与＋パッシブ収入が入り、固定費が引かれます。その後イベントが発生します
- **オファー**：投資/副業などを購入してパッシブ収入を増やします
- **勝利条件**：パッシブ収入が固定費以上になったらクリアです

※本MVPは学習用にルールを簡略化しています（例：オファーは「頭金のみ」支払いで、毎月の純キャッシュフローはカードに内包）。
"""
    )

with st.sidebar:
    st.subheader("🎛 設定")
    roles = st.session_state.roles
    role_labels = {r["id"]: f'{r["name"]}（給与 {r["salary"]:,} / 固定費 {r["fixed_expenses"]:,}）' for r in roles}
    role_id = st.selectbox("職業", options=list(role_labels.keys()), format_func=lambda x: role_labels[x])
    seed_str = st.text_input("シード（空欄OK）", value="")
    seed = int(seed_str) if seed_str.strip().isdigit() else None

    if st.button("ゲーム開始 / リセット", type="primary", use_container_width=True):
        _reset_game(role_id, seed)

    if st.button("セーブ読み込み（JSON）", use_container_width=True):
        st.session_state._show_load = True

    if st.session_state.get("_show_load", False):
        raw = st.text_area("ここにセーブJSONを貼り付け", height=160)
        if st.button("読み込み実行", use_container_width=True):
            try:
                data = json.loads(raw)
                st.session_state.game = GameState.from_dict(data)
                st.session_state._show_load = False
                st.success("読み込みました。")
            except Exception as e:  # noqa: BLE001
                st.error(f"読み込みに失敗しました: {e}")

    st.divider()
    st.caption("データ編集：`data/roles.json`, `data/offers.json`, `data/events.json`")


game: GameState | None = st.session_state.game
if game is None:
    st.info("左のサイドバーで職業を選んで「ゲーム開始 / リセット」を押してください。")
    st.stop()

    summary = summarize_state(game)
    k1, k2, k3, k4, k5 = st.columns(5)
    k1.metric("月", f"{game.month}")
    k2.metric("現金", f'{summary["cash"]:,}')
    k3.metric("給与（毎月）", f'{summary["salary"]:,}')
    k4.metric("固定費（毎月）", f'{summary["fixed_expenses"]:,}')
    k5.metric("パッシブ収入（毎月）", f'{summary["passive_income"]:,}')

    st.caption(f'毎月の純キャッシュフロー: {summary["net_monthly"]:+,} / 純資産(目安): {summary["net_worth"]:+,}')
    denom = max(1, summary["fixed_expenses"])
    progress = max(0.0, min(1.0, summary["passive_income"] / denom))
    st.progress(progress, text=f"クリアまで：パッシブ {summary['passive_income']:,} / 固定費 {summary['fixed_expenses']:,}")

    win = check_win(game)
    if win:
        st.success("クリア！ パッシブ収入が固定費以上になりました。")
        _download_save(game)
        st.stop()

    st.divider()

    if not game.in_month:
        st.subheader("▶ 月の開始")
        if st.button("今月を開始（収支計算 → イベント → オファー提示）", type="primary", use_container_width=True):
            process_month_start(game)
            event = draw_cards(game, deck="events", n=1)[0]
            game.current_event = event
            apply_event(game, event)
            game.current_offers = draw_cards(game, deck="offers", n=2)
    else:
        st.subheader("⚡ 今月のイベント")
        if game.current_event is None:
            st.warning("イベントが未設定です（想定外）。月をスキップして次に進めてください。")
        else:
            ev = game.current_event
            with st.container(border=True):
                st.markdown(f"**{ev.name}**")
                st.write(ev.description)
                st.caption(f'影響: {ev.effect_summary()}')

        st.subheader("🃏 今月のオファー（投資/副業/学習）")
        if not game.current_offers:
            st.info("オファーがありません。次の月へ進めてください。")
        else:
            for idx, offer in enumerate(game.current_offers):
                with st.container(border=True):
                    cols = st.columns([0.68, 0.32])
                    with cols[0]:
                        st.markdown(f"**{offer.name}**（{offer.kind_label()}）")
                        st.write(offer.description)
                        st.caption(
                            f"頭金: {offer.down_payment:,} / パッシブ収入 +{offer.passive_income_delta:,}/月 / "
                            f"給与 +{offer.salary_delta:,}/月 / 一時影響 {offer.cash_delta:+,}"
                        )
                    with cols[1]:
                        affordable = can_afford_offer(game, offer)
                        if st.button(
                            "購入する",
                            key=f"buy_{game.month}_{idx}_{offer.id}",
                            disabled=not affordable,
                            use_container_width=True,
                        ):
                            purchase_offer(game, offer)
                            st.rerun()
                        st.caption("※現金が足りない場合は購入できません。")

        st.divider()
        st.subheader("⏭ 次の月へ")
        st.caption("購入しなくてもOKです。月末処理はありません（MVP）。")
        if st.button("この月を終了して次の月へ", type="primary", use_container_width=True):
            game.in_month = False
            game.current_event = None
            game.current_offers = []
            game.month += 1
            game.log.append(f"月終了：次は {game.month}月")

    st.divider()
    with st.expander("資産・履歴（確認用）", expanded=False):
        st.markdown("**保有オファー**")
        if not game.portfolio:
            st.write("なし")
        else:
            for it in game.portfolio:
                st.write(f'- {it["name"]}（パッシブ +{it["passive_income_delta"]:,}/月）')

        st.markdown("**履歴（直近）**")
        for row in game.log[-12:]:
            st.write(f"- {row}")

        st.divider()
        st.markdown("**セーブ**")
        _download_save(game)
