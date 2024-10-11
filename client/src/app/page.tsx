"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

interface Data {
  id: string;
  memo: string;
  qr_img: string;
  passkey: string;
  created_at: string;
}

export default function Home() {
  const [code, setCode] = useState<string>(""); // 入力を一つの文字列で管理
  const [textareaValue, setTextareaValue] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCodeEntered, setIsCodeEntered] = useState(false);
  const [data, setData] = useState<Data | null>(null); // レスポンスデータを保存するステート
  const [query, setQuery] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [isCoppied, setIsCoppied] = useState(false);
  const [isComposing, setIsComposing] = useState<boolean>(false); // IME合成中かどうかの状態

  // クエリパラメータの取得
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("id"));
    }
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (code.length > 0 && !isComposing) {
      handleCodePost(); // 入力がある場合にリクエストを送る
    } else {
      setError(false);
    }
  }, [code, isComposing]);

  // コピーボタンの機能実装
  const handleCopy = () => {
    navigator.clipboard.writeText(textareaValue).then(() => {
      setIsCoppied(true);
      setTimeout(() => {
        setIsCoppied(false);
      }, 1000); // 1秒後に元に戻る
    });
  };

  // 確認ボタン押下でPOSTリクエストを送信
  const handleConfirm = async () => {
    try {
      const response = await axios.post(
        "https://katsushika-project.net/memos/create/",
        {
          memo: textareaValue,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data.id);

      if (response.status === 201) {
        const responseData = response.data;
        setData(responseData); // レスポンスデータを保存
      } else {
        console.error("失敗:", response.statusText);
      }
    } catch (error) {
      console.error("エラー:", error);
    }
  };

  // passkeyのPOSTリクエストを送信
  const handleCodePost = async () => {
    try {
      if (!query) {
        const response = await axios.post(
          "https://katsushika-project.net/memos/",
          {
            passkey: code,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          const responseData = response.data;
          setTextareaValue(responseData.memo);
          setIsCodeEntered(true);
          setError(false);
        } else {
          setError(true);
          setIsCodeEntered(false);
        }
      }
    } catch (error) {
      console.error("エラー:", error);
      setError(true);
      setIsCodeEntered(false);
    }
  };

  // QRのPOSTリクエストを送信
  const handleQueryPost = async () => {
    try {
      const response = await axios.get(
        `https://katsushika-project.net/memos/${query}`
      );

      if (response.status === 200) {
        const responseData = response.data;
        setTextareaValue(responseData.memo);
        const passkeyArray = responseData.passkey;
        setCode(passkeyArray);
        setIsCodeEntered(true);
      } else {
        console.error("失敗:", response.statusText);
      }
    } catch (error) {
      console.error("エラー:", error);
    }
  };

  //queryが存在する場合、リクエストを送る
  useEffect(() => {
    if (query) {
      handleQueryPost();
    }
  }, [query]);

  return (
    <div className="flex flex-col lg:flex-row p-8 lg:p-[82px_79px] h-auto lg:h-screen box-border text-white bg-[#333333] justify-center gap-[15%_15%] whitespace-normal lg:whitespace-nowrap">
      <div className="flex flex-col justify-between">
        <div>
          <a
            href="https://www.copitto.com/"
            className="m-0 font-normal text-[28px] text-white no-underline"
          >
            PC←→スマホ
            <br />
            ログイン不要で
            <br />
            自由にコピペができます
          </a>
        </div>

        <div>
          <p className="m-0 pt-5">
            コピペ内容を貼り付けて、端末にコードが表示されている方↓
          </p>
          <div className="p-5 rounded-lg bg-[#555] my-3 flex flex-col items-center">
            <p className="m-0">端末に表示されているコードを入力してください</p>
            {error ? (
              <p className="m-0 text-[#FF5B5B] text-sm">コードが違います。</p>
            ) : (
              ""
            )}
            <div className="flex mt-5 p-[6px_10px] w-auto lg:w-[280px] rounded-lg justify-center">
              <input
                value={code}
                maxLength={6}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="true"
                ref={inputRef}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(
                  e: React.CompositionEvent<HTMLInputElement>
                ) => {
                  setIsComposing(false);
                  setCode(e.currentTarget.value);
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCode(e.currentTarget.value);
                }}
                className="w-full h-[45px] text-lg border-none rounded-lg outline-none p-1 text-center text-black"
              />
            </div>
          </div>
          <div className="flex justify-between text-xs flex-col lg:flex-row gap-2.5 lg:gap-0">
            <p className="m-0">入力後、貼り付けた内容が下記に表示されます。</p>
            <p className="m-0">半角英数字6字</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {!isCodeEntered ? (
            <>
              <h3 className="text-[18px] m-0 pt-5 font-bold">
                手順
                <br />
                ①コピペする内容を下の欄に入力する
              </h3>
            </>
          ) : (
            <h3 className="m-0 pt-5">結果</h3>
          )}
          <textarea
            placeholder="コピペ内容を貼り付けてください"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            className="text-black text-[13px] resize-none p-[4px_12px] rounded-lg outline-none h-[52px] overflow-y-auto border-2 border-white focus:border-[#D65C5C] placeholder:text-[rgb(118,118,118)]"
          />

          <div className="flex items-center gap-2.5 justify-end flex-col lg:flex-row">
            {!isCodeEntered ? (
              <>
                <h3 className="m-0 font-bold text-[18px]">②確定ボタンを押す</h3>
                <button
                  onClick={
                    textareaValue
                      ? () => {
                          setIsConfirmed(true);
                          handleConfirm();
                        }
                      : undefined
                  }
                  className={`p-[9px_24px] text-[#ECECEC] text-[13px] rounded-lg font-bold ${
                    isConfirmed
                      ? "bg-[#C0C0C0]"
                      : textareaValue
                      ? "bg-[#FF5B5B]"
                      : "bg-[#C0C0C0]"
                  }`}
                >
                  確定する
                </button>
              </>
            ) : (
              <button
                onClick={handleCopy}
                className={`p-2.5 text-[#ECECEC] rounded-lg font-bold ${
                  isCoppied ? "bg-[#4cd997]" : "bg-[#FF5B5B]"
                }`}
              >
                {isCoppied ? "コピっと！" : "コピーする"}
              </button>
            )}
          </div>
          {isConfirmed && !isCodeEntered ? (
            <div className="flex justify-end gap-2.5 items-center flex-col lg:flex-row">
              <p className="m-0 text-xs">QRコードを削除してやり直す</p>
              <button
                onClick={() => {
                  setTextareaValue("");
                  setIsConfirmed(false);
                  setData(null);
                  setCode("");
                }}
                className="p-1.5 text-[#FF5B5B] bg-[#333333] !border !border-[3px] border-[#FF5B5B] rounded-lg font-bold"
              >
                リセット
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="flex flex-col items-center justify-between">
        <h3 className="m-0 font-bold text-[18px] pt-[70px] lg:pt-0">
          ③QRコードをスマートフォンで読み込む
        </h3>
        <p className="mt-3 text-xs">
          コピペ内容を貼り付けるとQRコードが表示されます。
        </p>
        {data ? (
          <img
            src={data?.qr_img}
            className="bg-white/60 rounded-lg my-5 aspect-[1/1] h-[280px] lg:h-[200px]"
          />
        ) : (
          <div className="bg-white/45 rounded-lg my-5 aspect-[1/1] h-[280px] lg:h-[300px] min-h-[170px]" />
        )}
        <div className="flex flex-col items-center text-[16px]">
          <p className="m-0">スマートフォンでスキャン</p>
          <p className="my-4">または</p>
          <p className="mt-2 whitespace-nowrap">表示されているコードを入力</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="my-8 whitespace-nowrap">次のコードを入力してください</p>
          <p
            className={`text-${
              data ? "gray-900" : "gray-400"
            } text-[#7D7D7D] bg-white justify-center items-center h-[51px] flex rounded-lg font-bold w-full text-${
              data ? "2xl" : "xs"
            } px-4`}
          >
            {data ? data.passkey : "コピペ内容を貼り付けると表示されます"}
          </p>
        </div>
        <p className="mt-4">※有効期限は15分です</p>
      </div>
    </div>
  );
}
