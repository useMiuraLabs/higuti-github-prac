// API がエラーのときに返す形。FE はこの形を前提に表示する
export type ApiError = {
  message: string;
  // 入力エラー (400) のときだけ。項目名 → その項目の最初のエラー文
  fieldErrors?: Record<string, string>;
};
