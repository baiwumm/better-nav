/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2025-11-21 09:16:01
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-07-01 15:41:04
 * @Description: 统计代码
 */
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

/**
 * @description: 谷歌统计
 */
export function GoogleUtilities() {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ID;

  if (process.env.NODE_ENV !== "production" || !gaId) return null;

  return <GoogleAnalytics gaId={gaId} />;
}

/**
 * @description: 微软统计
 */
export function MicrosoftClarity() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  if (process.env.NODE_ENV !== "production" || !clarityId) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){
            (c[a].q=c[a].q||[]).push(arguments)
          };
          t=l.createElement(r);
          t.async=1;
          t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];
          y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script","${clarityId}");
      `}
    </Script>
  );
}
