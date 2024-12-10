"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

interface Data {
  id: string;
  memo: string;
  qr_img: string;
  passkey: string;
  created_at: string;
}

export default function Home() {
  const [code, setCode] = useState<string>("");
  const [textareaValue, setTextareaValue] = useState("");
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [hasCodeEntered, setHasCodeEntered] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [query, setQuery] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("id"));
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (code.length > 0 && !isComposing) {
      handleCodePost();
    } else {
      setError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isComposing]);

  // コピーボタンの機能実装
  const handleCopy = () => {
    navigator.clipboard.writeText(textareaValue).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    });
  };

  // 確認ボタン押下でPOSTリクエストを送信
  const handleConfirm = async () => {
    if (!textareaValue || isLoading) return;
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://katsushika-project.net/memos/create/",
        { memo: textareaValue },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 201) {
        setData(response.data);
        setHasConfirmed(true);
      } else {
        console.error("失敗:", response.statusText);
      }
    } catch (err) {
      console.error("エラー:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // passkeyのPOSTリクエストを送信
  const handleCodePost = async () => {
    if (!code || isLoading) return;
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://katsushika-project.net/memos/",
        { passkey: code },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        const responseData = response.data;
        setTextareaValue(responseData.memo);
        setHasCodeEntered(true);
        setError(false);
      } else {
        setError(true);
        setHasCodeEntered(false);
      }
    } catch (err) {
      console.error("エラー:", err);
      setError(true);
      setHasCodeEntered(false);
    } finally {
      setIsLoading(false);
    }
  };

  // QRのGETリクエストを送信
  const handleQueryPost = async () => {
    if (!query || isLoading) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://katsushika-project.net/memos/${query}`
      );
      if (response.status === 200) {
        const responseData = response.data;
        setTextareaValue(responseData.memo);
        setCode(responseData.passkey);
        setHasCodeEntered(true);
      } else {
        console.error("失敗:", response.statusText);
      }
    } catch (err) {
      console.error("エラー:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // queryが存在する場合、リクエストを送る
  useEffect(() => {
    if (query) {
      handleQueryPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {error && (
              <p className="m-0 text-[#FF5B5B] text-sm">コードが違います。</p>
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
                onCompositionEnd={(e) => {
                  setIsComposing(false);
                  setCode(e.currentTarget.value);
                }}
                onChange={(e) => setCode(e.currentTarget.value)}
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
          {!hasCodeEntered ? (
            <h3 className="text-[18px] m-0 pt-5 font-bold">
              手順
              <br />
              ①コピペする内容を下の欄に入力する
            </h3>
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
            {!hasCodeEntered ? (
              <>
                <h3 className="m-0 font-bold text-[18px]">②確定ボタンを押す</h3>
                <button
                  onClick={handleConfirm}
                  disabled={!textareaValue || isLoading}
                  className={`p-[9px_24px] text-[#ECECEC] text-[13px] rounded-lg font-bold ${
                    hasConfirmed
                      ? "bg-[#C0C0C0]"
                      : textareaValue && !isLoading
                      ? "bg-[#FF5B5B]"
                      : "bg-[#C0C0C0]"
                  }`}
                >
                  {isLoading ? "送信中..." : "確定する"}
                </button>
              </>
            ) : (
              <button
                onClick={handleCopy}
                className={`p-2.5 text-[#ECECEC] rounded-lg font-bold ${
                  isCopied ? "bg-[#4cd997]" : "bg-[#FF5B5B]"
                }`}
              >
                {isCopied ? "コピっと！" : "コピーする"}
              </button>
            )}
          </div>
          {hasConfirmed && !hasCodeEntered && (
            <div className="flex justify-end gap-2.5 items-center flex-col lg:flex-row">
              <p className="m-0 text-xs">QRコードを削除してやり直す</p>
              <button
                onClick={() => {
                  setTextareaValue("");
                  setHasConfirmed(false);
                  setData(null);
                  setCode("");
                  setError(false);
                }}
                className="p-1.5 text-[#FF5B5B] bg-[#333333] !border-[3px] border-[#FF5B5B] rounded-lg font-bold"
              >
                リセット
              </button>
            </div>
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
          <div className="bg-[#f5f5f5] rounded-lg my-5 aspect-[1/1] h-[280px] lg:h-[200px]">
            <QRCodeSVG
              value={`https://www.copitto.com/?id=${data.id}`}
              className="w-full h-full p-6 rounded-lg"
              bgColor="#f5f5f5"
            />
          </div>
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
            className={`text-[#7D7D7D] bg-white justify-center items-center h-[51px] flex rounded-lg font-bold w-full ${
              data ? "text-2xl" : "text-xs"
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
