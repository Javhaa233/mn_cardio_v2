import React, { useEffect, useRef, useState } from "react";

import mapUrl from "assets/img/mongolia-aimags.svg";
import "./LoginScene.css";

// If the map image never arrives, start the animation anyway rather than
// leaving the user looking at an empty stage.
const MAP_TIMEOUT_MS = 300;

/**
 * LoginScene
 *
 * The animated backdrop for the login page: an outline of Mongolia with a node
 * per aimag, spokes carrying telemedicine traffic to and from the Ulaanbaatar
 * hub, and an ECG trace across the middle.
 *
 * The 22 aimag shapes are a separate SVG file drawn as an <img>, not inline
 * markup: they are 17KB of path data that never animate individually, so
 * inlining them cost the JS bundle and 22 DOM nodes for nothing. The browser
 * decodes the image off the main thread and caches it. Its colours are baked in
 * - an external SVG cannot read the page's CSS variables - but its own <style>
 * still honours prefers-color-scheme, so the dark palette survives.
 *
 * Everything that actually moves stays inline, and none of it starts until the
 * map has painted, so the animation never plays against a blank background.
 *
 * Purely decorative, so it is hidden from assistive technology. It also stops
 * animating when the tab is hidden, and dims while the user is typing, so it
 * never competes with the form for attention.
 *
 * All of its CSS lives in LoginScene.css, scoped under .login-v2 and with every
 * keyframe namespaced `lg-`, because keyframe names are global.
 */
function LoginScene({ Quiet = false }) {
  const stageRef = useRef(null);
  const [Ready, setReady] = useState(false);

  useEffect(() => {
    const onVisibility = () => {
      const el = stageRef.current;
      if (el) el.classList.toggle("halt", document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (Ready) return undefined;
    const id = setTimeout(() => setReady(true), MAP_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [Ready]);

  return (
    <div
      className={"stage" + (Quiet ? " quiet" : "") + (Ready ? " ready" : "")}
      ref={stageRef}
      aria-hidden="true"
    >
      <img
        className="map"
        src={mapUrl}
        alt=""
        decoding="async"
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
      />
      {/* xMin, not xMid, on preserveAspectRatio below. The map artwork spans
          x 23.8-1224.2, so its centre is x=624 while the viewBox centre is 800 -
          the 376-unit band on the right is reserved for the login panel. With
          xMid a narrow/tall window cropped symmetrically about x=800 and cut
          179px off Mongolia's WEST (measured at 1280x950). Anchoring left makes
          the crop eat the empty right band instead. mongolia-aimags.svg MUST
          carry the identical value or the outline and the fills drift apart. */}
      <svg
        className="scene"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMinYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="rings">
          <circle className="ring" cx="731" cy="389" r="70" />
          <circle className="ring" cx="731" cy="389" r="145" />
          <circle className="ring" cx="731" cy="389" r="225" />
          <circle className="ring" cx="731" cy="389" r="310" />
          <circle className="ring" cx="731" cy="389" r="400" />
          <circle className="ring" cx="731" cy="389" r="495" />
        </g>

        <g transform="translate(14.0,108.4) scale(1.22)">
          <path
            className="coast"
            d="M361.0,471.5 L344.0,475.8 L267.8,460.5 L239.4,461.0 L238.9,452.4 L225.5,435.6 L224.9,428.1 L221.2,417.5 L217.5,402.0 L216.8,401.0 L210.7,398.6 L211.5,392.1 L214.5,386.8 L202.6,386.7 L192.0,381.5 L188.9,376.8 L184.1,373.1 L181.2,372.4 L176.9,365.1 L172.9,365.0 L168.7,363.5 L163.0,353.5 L157.3,349.2 L154.0,348.6 L151.6,346.9 L148.5,346.6 L146.1,345.1 L139.0,344.3 L136.1,342.3 L123.9,342.5 L115.7,340.8 L110.5,337.0 L94.2,334.7 L91.7,330.9 L89.1,332.0 L85.5,330.7 L82.3,327.0 L80.0,325.7 L73.9,326.2 L74.2,323.1 L72.2,321.0 L71.8,314.9 L69.1,311.1 L72.9,299.7 L84.1,288.9 L84.6,284.7 L82.8,275.7 L89.5,264.5 L88.1,262.9 L89.5,258.1 L87.5,252.7 L88.2,249.9 L86.9,245.7 L82.4,242.4 L77.1,227.9 L78.2,224.8 L77.2,223.4 L77.7,219.4 L75.2,212.9 L76.0,211.4 L70.9,208.1 L68.8,205.6 L68.6,199.8 L65.7,199.1 L65.0,200.8 L63.5,201.5 L59.3,200.8 L58.9,198.2 L57.0,196.8 L55.3,193.6 L55.4,190.9 L54.6,190.3 L51.0,190.1 L49.0,188.9 L44.4,190.9 L39.3,189.3 L36.4,183.4 L33.1,182.8 L30.7,179.5 L27.6,177.5 L27.1,174.1 L27.9,170.7 L26.5,168.1 L23.9,167.6 L21.2,163.5 L17.3,161.6 L11.7,156.7 L11.6,155.5 L15.6,152.8 L16.1,151.3 L14.0,148.6 L9.7,146.3 L8.1,141.3 L9.0,139.9 L12.9,138.5 L13.2,136.9 L11.9,135.5 L13.0,129.2 L17.2,129.9 L23.6,126.5 L23.5,122.4 L26.9,118.5 L32.3,118.6 L36.9,119.9 L39.4,119.1 L41.3,121.7 L46.4,123.1 L47.1,118.5 L48.3,118.8 L49.6,122.8 L55.4,121.7 L57.4,120.1 L56.7,117.5 L58.1,116.1 L62.3,119.3 L64.8,116.8 L73.0,114.8 L73.3,113.3 L71.4,111.3 L72.1,110.0 L71.5,108.8 L72.2,106.1 L73.7,105.2 L82.8,105.0 L85.1,100.5 L91.3,99.6 L99.4,96.3 L105.4,97.2 L107.2,94.0 L110.7,93.2 L116.5,89.3 L119.9,89.8 L123.9,88.5 L128.4,89.5 L130.6,86.4 L133.7,85.6 L136.5,82.4 L139.6,80.9 L144.0,80.5 L151.4,82.4 L154.0,81.3 L156.5,76.0 L158.4,75.1 L160.2,79.1 L165.4,85.1 L168.1,84.0 L169.2,81.1 L170.4,80.5 L175.1,81.6 L175.5,88.8 L178.1,90.3 L187.3,91.0 L190.5,92.6 L211.2,96.4 L212.4,103.6 L212.2,111.9 L213.1,113.8 L215.9,115.6 L218.4,122.0 L227.9,121.9 L231.9,127.0 L240.1,127.7 L244.1,131.0 L246.8,128.9 L250.9,128.3 L254.3,125.8 L255.5,126.2 L257.5,129.9 L260.9,127.5 L266.0,130.2 L269.0,133.3 L273.8,132.2 L275.9,135.3 L279.6,133.1 L287.3,135.0 L292.3,141.7 L295.4,143.0 L297.8,142.8 L305.0,138.2 L305.1,135.0 L310.8,133.4 L312.8,135.3 L319.6,131.2 L321.4,129.4 L326.7,119.7 L328.3,109.0 L321.2,103.7 L319.0,96.6 L320.4,93.3 L316.4,88.7 L315.7,85.9 L320.0,76.4 L320.1,71.7 L323.9,65.5 L326.1,64.4 L329.1,65.1 L329.7,60.1 L333.1,54.2 L341.4,51.9 L343.3,50.2 L348.3,41.1 L349.0,37.4 L351.1,36.4 L352.8,39.8 L359.4,43.1 L361.8,46.0 L372.6,49.0 L378.2,55.3 L380.7,56.2 L395.1,57.0 L412.1,66.7 L415.6,67.4 L418.6,70.5 L423.7,69.4 L439.3,74.4 L442.7,77.5 L440.9,80.6 L441.2,87.1 L443.5,92.6 L443.0,100.9 L446.2,104.6 L444.6,107.7 L445.3,111.7 L447.3,113.1 L450.2,113.5 L454.4,119.3 L458.6,120.5 L462.3,123.3 L464.8,124.2 L471.5,124.2 L473.7,128.7 L478.4,129.0 L483.2,131.7 L485.2,131.8 L488.6,129.3 L496.1,131.3 L498.5,130.9 L500.7,129.9 L506.8,123.9 L512.8,123.2 L514.5,121.6 L518.0,121.3 L521.2,119.6 L527.2,119.4 L531.1,116.2 L533.6,115.3 L542.8,117.6 L546.9,117.2 L552.9,118.3 L555.1,121.3 L560.0,123.0 L566.4,121.1 L572.7,120.9 L576.6,122.4 L582.3,126.5 L585.0,132.0 L589.1,135.0 L592.4,134.6 L594.2,136.1 L605.0,135.7 L607.4,136.9 L611.5,137.1 L611.2,140.9 L612.3,145.7 L611.6,149.2 L613.9,149.4 L614.9,152.8 L617.8,154.5 L621.1,155.0 L624.3,159.2 L630.7,163.9 L642.4,162.1 L645.5,162.8 L649.2,161.7 L653.0,161.8 L658.0,162.9 L660.1,165.1 L666.4,164.1 L669.2,165.6 L680.4,167.8 L682.9,166.8 L685.7,163.6 L693.0,167.4 L696.9,167.4 L703.6,163.6 L714.0,155.3 L718.3,155.8 L723.4,152.9 L734.3,151.0 L746.8,143.9 L753.8,145.1 L756.0,144.4 L760.6,140.4 L763.8,139.1 L764.1,134.8 L766.2,129.2 L776.6,117.8 L781.3,114.5 L784.2,114.0 L787.3,109.9 L795.7,103.4 L801.4,104.6 L806.7,103.0 L809.5,103.3 L817.2,106.4 L824.6,113.4 L830.3,116.2 L840.0,115.3 L851.2,107.2 L853.6,106.8 L864.8,109.3 L868.7,113.2 L856.8,159.5 L857.2,164.2 L852.0,176.9 L854.2,189.2 L846.3,195.5 L849.2,204.3 L850.7,206.2 L859.6,213.3 L861.7,213.9 L865.9,207.5 L870.4,204.2 L878.3,204.1 L887.8,200.7 L895.8,202.4 L904.6,208.1 L905.9,208.0 L915.4,190.3 L927.7,186.4 L930.9,187.2 L936.7,186.4 L939.0,187.1 L947.7,195.2 L958.1,197.6 L960.8,203.3 L966.7,204.6 L966.4,207.5 L981.5,216.3 L983.7,218.9 L985.2,223.4 L988.5,226.6 L990.0,226.8 L990.9,233.4 L992.0,235.3 L990.9,237.8 L988.8,238.5 L986.2,242.0 L980.4,241.5 L974.8,243.4 L966.5,242.8 L962.9,239.8 L961.3,241.6 L958.9,239.4 L955.8,244.2 L952.2,243.5 L948.1,245.3 L941.5,244.8 L931.1,252.2 L928.6,256.7 L924.8,257.6 L920.8,254.2 L919.2,255.7 L915.7,256.7 L916.6,258.7 L915.6,262.4 L916.0,265.6 L914.6,267.2 L899.1,268.2 L896.7,271.3 L892.2,273.8 L891.3,276.9 L887.0,283.3 L883.9,293.0 L885.9,297.6 L883.3,303.0 L879.0,304.6 L870.0,316.4 L864.1,319.2 L847.3,323.5 L839.5,322.2 L834.4,324.9 L831.9,333.7 L824.3,342.7 L822.8,346.1 L820.7,348.0 L816.7,349.4 L809.5,357.9 L792.1,357.8 L780.2,356.0 L774.6,353.9 L768.3,348.1 L758.4,349.1 L754.0,348.7 L750.1,351.3 L747.0,355.0 L742.3,368.1 L742.4,373.2 L739.3,379.8 L738.9,384.5 L742.2,387.1 L743.6,391.3 L748.0,396.5 L755.3,401.6 L759.5,408.2 L759.6,412.3 L753.8,414.5 L748.4,422.4 L743.0,424.2 L729.5,432.9 L720.9,445.6 L718.9,451.0 L714.1,456.4 L712.9,459.7 L701.8,466.6 L696.8,467.4 L688.8,471.8 L683.0,476.8 L675.3,478.4 L665.3,478.2 L659.9,480.8 L638.8,479.6 L591.3,489.7 L538.6,516.2 L532.3,523.1 L530.9,523.6 L528.1,521.0 L514.8,520.6 L514.5,510.8 L486.8,516.1 L465.6,504.9 L430.3,496.2 L425.3,491.8 L420.4,483.3 L417.1,480.8 L409.5,479.2 L403.0,479.7 L361.0,471.5Z"
            pathLength="100"
          />
        </g>

        <g className="reglinks">
          <path
            className="reglink"
            d="M193,415 Q132,388 94,334"
            style={{ "--d": "4.20s" }}
          />
          <path
            className="reglink"
            d="M193,415 Q187,339 222,271"
            style={{ "--d": "4.28s" }}
          />
          <path
            className="reglink"
            d="M193,415 Q229,486 296,528"
            style={{ "--d": "4.36s" }}
          />
          <path
            className="reglink"
            d="M193,415 Q252,369 326,360"
            style={{ "--d": "4.44s" }}
          />
          <path
            className="reglink"
            d="M629,331 Q611,342 590,342"
            style={{ "--d": "4.52s" }}
          />
          <path
            className="reglink"
            d="M629,331 Q547,317 485,262"
            style={{ "--d": "4.60s" }}
          />
          <path
            className="reglink"
            d="M629,331 Q551,339 488,386"
            style={{ "--d": "4.68s" }}
          />
          <path
            className="reglink"
            d="M994,338 Q978,400 997,462"
            style={{ "--d": "4.76s" }}
          />
          <path
            className="reglink"
            d="M994,338 Q920,343 859,386"
            style={{ "--d": "4.84s" }}
          />
          <path
            className="reglink"
            d="M611,649 Q639,575 701,526"
            style={{ "--d": "4.92s" }}
          />
          <path
            className="reglink"
            d="M611,649 Q517,618 452,543"
            style={{ "--d": "5.00s" }}
          />
        </g>
        <g className="spokes">
          <path
            className="spoke"
            d="M731,389 Q403,476 94,334"
            pathLength="100"
            style={{ "--d": "2.60s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q467,499 193,415"
            pathLength="100"
            style={{ "--d": "2.66s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q455,422 222,271"
            pathLength="100"
            style={{ "--d": "2.72s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q488,380 296,528"
            pathLength="100"
            style={{ "--d": "2.78s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q523,447 326,360"
            pathLength="100"
            style={{ "--d": "2.84s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q564,416 452,543"
            pathLength="100"
            style={{ "--d": "2.90s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q624,497 611,649"
            pathLength="100"
            style={{ "--d": "2.96s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q585,370 485,262"
            pathLength="100"
            style={{ "--d": "3.02s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q851,473 997,462"
            pathLength="100"
            style={{ "--d": "3.08s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q853,316 994,338"
            pathLength="100"
            style={{ "--d": "3.14s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q609,431 488,386"
            pathLength="100"
            style={{ "--d": "3.20s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q756,498 845,566"
            pathLength="100"
            style={{ "--d": "3.26s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q627,422 568,514"
            pathLength="100"
            style={{ "--d": "3.32s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q652,391 590,342"
            pathLength="100"
            style={{ "--d": "3.38s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q691,452 701,526"
            pathLength="100"
            style={{ "--d": "3.44s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q795,365 859,386"
            pathLength="100"
            style={{ "--d": "3.50s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q669,379 629,331"
            pathLength="100"
            style={{ "--d": "3.56s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q702,352 704,305"
            pathLength="100"
            style={{ "--d": "3.62s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q725,344 749,304"
            pathLength="100"
            style={{ "--d": "3.68s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q707,404 679,399"
            pathLength="100"
            style={{ "--d": "3.74s" }}
          />
          <path
            className="spoke"
            d="M731,389 Q755,403 782,398"
            pathLength="100"
            style={{ "--d": "3.80s" }}
          />
        </g>
        <g className="pulses">
          <path
            className="pulse ask"
            d="M94,334 Q403,476 731,389"
            pathLength="100"
            style={{ animationName: "lg-go0" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q403,476 94,334"
            pathLength="100"
            style={{ animationName: "lg-rt0" }}
          />
          <path
            className="pulse ask"
            d="M193,415 Q467,499 731,389"
            pathLength="100"
            style={{ animationName: "lg-go1" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q467,499 193,415"
            pathLength="100"
            style={{ animationName: "lg-rt1" }}
          />
          <path
            className="pulse ask"
            d="M222,271 Q455,422 731,389"
            pathLength="100"
            style={{ animationName: "lg-go2" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q455,422 222,271"
            pathLength="100"
            style={{ animationName: "lg-rt2" }}
          />
          <path
            className="pulse ask"
            d="M296,528 Q488,380 731,389"
            pathLength="100"
            style={{ animationName: "lg-go3" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q488,380 296,528"
            pathLength="100"
            style={{ animationName: "lg-rt3" }}
          />
          <path
            className="pulse ask"
            d="M326,360 Q523,447 731,389"
            pathLength="100"
            style={{ animationName: "lg-go4" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q523,447 326,360"
            pathLength="100"
            style={{ animationName: "lg-rt4" }}
          />
          <path
            className="pulse ask"
            d="M452,543 Q564,416 731,389"
            pathLength="100"
            style={{ animationName: "lg-go5" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q564,416 452,543"
            pathLength="100"
            style={{ animationName: "lg-rt5" }}
          />
          <path
            className="pulse ask"
            d="M611,649 Q624,497 731,389"
            pathLength="100"
            style={{ animationName: "lg-go6" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q624,497 611,649"
            pathLength="100"
            style={{ animationName: "lg-rt6" }}
          />
          <path
            className="pulse ask"
            d="M485,262 Q585,370 731,389"
            pathLength="100"
            style={{ animationName: "lg-go7" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q585,370 485,262"
            pathLength="100"
            style={{ animationName: "lg-rt7" }}
          />
          <path
            className="pulse ask"
            d="M997,462 Q851,473 731,389"
            pathLength="100"
            style={{ animationName: "lg-go8" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q851,473 997,462"
            pathLength="100"
            style={{ animationName: "lg-rt8" }}
          />
          <path
            className="pulse ask"
            d="M994,338 Q853,316 731,389"
            pathLength="100"
            style={{ animationName: "lg-go9" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q853,316 994,338"
            pathLength="100"
            style={{ animationName: "lg-rt9" }}
          />
          <path
            className="pulse ask"
            d="M488,386 Q609,431 731,389"
            pathLength="100"
            style={{ animationName: "lg-go10" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q609,431 488,386"
            pathLength="100"
            style={{ animationName: "lg-rt10" }}
          />
          <path
            className="pulse ask"
            d="M845,566 Q756,498 731,389"
            pathLength="100"
            style={{ animationName: "lg-go11" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q756,498 845,566"
            pathLength="100"
            style={{ animationName: "lg-rt11" }}
          />
          <path
            className="pulse ask"
            d="M568,514 Q627,422 731,389"
            pathLength="100"
            style={{ animationName: "lg-go12" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q627,422 568,514"
            pathLength="100"
            style={{ animationName: "lg-rt12" }}
          />
          <path
            className="pulse ask"
            d="M590,342 Q652,391 731,389"
            pathLength="100"
            style={{ animationName: "lg-go13" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q652,391 590,342"
            pathLength="100"
            style={{ animationName: "lg-rt13" }}
          />
          <path
            className="pulse ask"
            d="M701,526 Q691,452 731,389"
            pathLength="100"
            style={{ animationName: "lg-go14" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q691,452 701,526"
            pathLength="100"
            style={{ animationName: "lg-rt14" }}
          />
          <path
            className="pulse ask"
            d="M859,386 Q795,365 731,389"
            pathLength="100"
            style={{ animationName: "lg-go15" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q795,365 859,386"
            pathLength="100"
            style={{ animationName: "lg-rt15" }}
          />
          <path
            className="pulse ask"
            d="M629,331 Q669,379 731,389"
            pathLength="100"
            style={{ animationName: "lg-go16" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q669,379 629,331"
            pathLength="100"
            style={{ animationName: "lg-rt16" }}
          />
          <path
            className="pulse ask"
            d="M704,305 Q702,352 731,389"
            pathLength="100"
            style={{ animationName: "lg-go17" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q702,352 704,305"
            pathLength="100"
            style={{ animationName: "lg-rt17" }}
          />
          <path
            className="pulse ask"
            d="M749,304 Q725,344 731,389"
            pathLength="100"
            style={{ animationName: "lg-go18" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q725,344 749,304"
            pathLength="100"
            style={{ animationName: "lg-rt18" }}
          />
          <path
            className="pulse ask"
            d="M679,399 Q707,404 731,389"
            pathLength="100"
            style={{ animationName: "lg-go19" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q707,404 679,399"
            pathLength="100"
            style={{ animationName: "lg-rt19" }}
          />
          <path
            className="pulse ask"
            d="M782,398 Q755,403 731,389"
            pathLength="100"
            style={{ animationName: "lg-go20" }}
          />
          <path
            className="pulse ans"
            d="M731,389 Q755,403 782,398"
            pathLength="100"
            style={{ animationName: "lg-rt20" }}
          />
          <path
            className="pulse loc"
            d="M193,415 Q132,388 94,334"
            pathLength="100"
            style={{ animationName: "lg-lo0" }}
          />
          <path
            className="pulse loc"
            d="M193,415 Q187,339 222,271"
            pathLength="100"
            style={{ animationName: "lg-lo1" }}
          />
          <path
            className="pulse loc"
            d="M193,415 Q229,486 296,528"
            pathLength="100"
            style={{ animationName: "lg-lo2" }}
          />
          <path
            className="pulse loc"
            d="M193,415 Q252,369 326,360"
            pathLength="100"
            style={{ animationName: "lg-lo3" }}
          />
          <path
            className="pulse loc"
            d="M629,331 Q611,342 590,342"
            pathLength="100"
            style={{ animationName: "lg-lo4" }}
          />
          <path
            className="pulse loc"
            d="M629,331 Q547,317 485,262"
            pathLength="100"
            style={{ animationName: "lg-lo5" }}
          />
          <path
            className="pulse loc"
            d="M629,331 Q551,339 488,386"
            pathLength="100"
            style={{ animationName: "lg-lo6" }}
          />
          <path
            className="pulse loc"
            d="M994,338 Q978,400 997,462"
            pathLength="100"
            style={{ animationName: "lg-lo7" }}
          />
          <path
            className="pulse loc"
            d="M994,338 Q920,343 859,386"
            pathLength="100"
            style={{ animationName: "lg-lo8" }}
          />
          <path
            className="pulse loc"
            d="M611,649 Q639,575 701,526"
            pathLength="100"
            style={{ animationName: "lg-lo9" }}
          />
          <path
            className="pulse loc"
            d="M611,649 Q517,618 452,543"
            pathLength="100"
            style={{ animationName: "lg-lo10" }}
          />
        </g>
        <g className="blips">
          <g
            className="blip"
            style={{ "--d": "3.00s" }}
            transform="translate(94,334)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack0" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Баян-Өлгий
            </text>
          </g>
          <g
            className="blip reg"
            style={{ "--d": "3.06s" }}
            transform="translate(193,415)"
          >
            <circle className="glow" r="13" />
            <circle className="rim" r="9" />
            <g className="ack" style={{ animationName: "lg-ack1" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="3" />
            </g>
            <text className="lbl" y="27">
              Ховд
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.12s" }}
            transform="translate(222,271)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack2" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Увс
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.18s" }}
            transform="translate(296,528)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack3" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Говь-Алтай
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.24s" }}
            transform="translate(326,360)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack4" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Завхан
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.30s" }}
            transform="translate(452,543)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack5" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Баянхонгор
            </text>
          </g>
          <g
            className="blip reg"
            style={{ "--d": "3.36s" }}
            transform="translate(611,649)"
          >
            <circle className="glow" r="13" />
            <circle className="rim" r="9" />
            <g className="ack" style={{ animationName: "lg-ack6" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="3" />
            </g>
            <text className="lbl" y="27">
              Өмнөговь
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.42s" }}
            transform="translate(485,262)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack7" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Хөвсгөл
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.48s" }}
            transform="translate(997,462)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack8" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Сүхбаатар
            </text>
          </g>
          <g
            className="blip reg"
            style={{ "--d": "3.54s" }}
            transform="translate(994,338)"
          >
            <circle className="glow" r="13" />
            <circle className="rim" r="9" />
            <g className="ack" style={{ animationName: "lg-ack9" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="3" />
            </g>
            <text className="lbl" y="27">
              Дорнод
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.60s" }}
            transform="translate(488,386)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack10" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Архангай
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.66s" }}
            transform="translate(845,566)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack11" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Дорноговь
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.72s" }}
            transform="translate(568,514)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack12" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Өвөрхангай
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.78s" }}
            transform="translate(590,342)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack13" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Булган
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.84s" }}
            transform="translate(701,526)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack14" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Дундговь
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "3.90s" }}
            transform="translate(859,386)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack15" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Хэнтий
            </text>
          </g>
          <g
            className="blip reg"
            style={{ "--d": "3.96s" }}
            transform="translate(629,331)"
          >
            <circle className="glow" r="13" />
            <circle className="rim" r="9" />
            <g className="ack" style={{ animationName: "lg-ack16" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="3" />
            </g>
            <text className="lbl" y="27">
              Орхон
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "4.02s" }}
            transform="translate(704,305)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack17" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Дархан-Уул
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "4.08s" }}
            transform="translate(749,304)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack18" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Сэлэнгэ
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "4.14s" }}
            transform="translate(679,399)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack19" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Төв
            </text>
          </g>
          <g
            className="blip"
            style={{ "--d": "4.20s" }}
            transform="translate(782,398)"
          >
            <circle className="glow" r="11" />
            <g className="ack" style={{ animationName: "lg-ack20" }}>
              <path className="tick" d="M-11,0 L-4,0 L-1,-16 L2,7 L5,0 L11,0" />
              <circle className="dot" r="2.4" />
            </g>
            <text className="lbl" y="27">
              Говьсүмбэр
            </text>
          </g>
        </g>

        <g className="hub" transform="translate(731,389)">
          <circle className="hub-glow" r="26" />
          <circle className="wave" r="6" />
          <circle className="wave" r="6" />
          <circle className="hub-core" r="4" />
        </g>

        <path
          className="trace base-c"
          d="M-40,389 L55,389 L65,380 L75,389 L85,399 L95,347 L103,405 L113,389 L129,389 L139,378 L149,389 L214,389 L224,380 L234,389 L244,399 L254,347 L262,405 L272,389 L288,389 L298,378 L308,389 L373,389 L383,380 L393,389 L403,399 L413,347 L421,405 L431,389 L447,389 L457,378 L467,389 L532,389 L542,380 L552,389 L562,399 L572,347 L580,405 L590,389 L606,389 L616,378 L626,389 L685,389 L699,375 L711,389 L720,415 L731,237"
          pathLength="100"
        />
        <path
          className="trace base-p"
          d="M731,237 L744,463 L759,389 L819,389 L839,369 L859,389 L925,389"
          pathLength="100"
        />
        <path
          className="trace run run-c"
          d="M-40,389 L55,389 L65,380 L75,389 L85,399 L95,347 L103,405 L113,389 L129,389 L139,378 L149,389 L214,389 L224,380 L234,389 L244,399 L254,347 L262,405 L272,389 L288,389 L298,378 L308,389 L373,389 L383,380 L393,389 L403,399 L413,347 L421,405 L431,389 L447,389 L457,378 L467,389 L532,389 L542,380 L552,389 L562,399 L572,347 L580,405 L590,389 L606,389 L616,378 L626,389 L685,389 L699,375 L711,389 L720,415 L731,237"
          pathLength="100"
        />
        <path
          className="trace run run-p"
          d="M731,237 L744,463 L759,389 L819,389 L839,369 L859,389 L925,389"
          pathLength="100"
        />

        <g className="heart">
          <g transform="translate(917.1,286.1) scale(0.23953) translate(-20,-55)">
            <g transform="translate(0,1024) scale(0.1,-0.1)">
              <g className="h-b">
                <path
                  className="hfill"
                  d="M2065 9094 c-60 -7 -139 -20 -175 -28 -36 -9 -83 -18 -105 -21 -22
      -4 -66 -15 -98 -26 -31 -10 -63 -19 -70 -19 -6 -1 -30 -9 -52 -20 -22 -11 -45
      -19 -51 -20 -16 0 -180 -70 -214 -90 -8 -5 -40 -22 -70 -38 -199 -105 -439
      -308 -584 -495 -153 -197 -276 -437 -344 -672 -50 -170 -54 -191 -92 -444 -7
      -48 -10 -182 -8 -370 4 -289 10 -355 49 -551 6 -30 17 -84 24 -120 17 -86 44
      -196 60 -245 7 -22 25 -80 40 -130 15 -49 36 -108 46 -131 11 -23 19 -46 19
      -52 0 -6 7 -26 15 -44 8 -18 37 -85 64 -148 46 -107 93 -200 155 -310 14 -25
      33 -58 42 -75 32 -58 207 -314 223 -325 3 -3 36 -41 73 -85 94 -114 339 -352
      608 -592 46 -42 438 -352 537 -426 235 -176 346 -257 411 -302 131 -91 186
      -129 307 -215 66 -47 131 -93 145 -102 14 -10 77 -53 140 -97 63 -45 171 -119
      240 -165 69 -47 175 -119 235 -161 61 -42 173 -119 250 -171 77 -53 181 -124
      230 -159 50 -35 119 -84 155 -108 36 -25 82 -58 102 -74 21 -15 74 -55 118
      -88 159 -118 317 -246 469 -379 102 -89 335 -324 411 -415 131 -157 135 -144
      49 164 -11 39 -24 84 -30 100 -6 17 -15 46 -20 65 -16 56 -75 210 -109 285
      -37 80 -153 311 -176 350 -13 22 -32 56 -43 75 -20 37 -138 214 -171 258 -161
      214 -290 363 -470 543 -113 113 -245 239 -295 280 -49 41 -92 77 -95 80 -8 11
      -325 261 -385 304 -31 22 -80 58 -110 80 -30 22 -102 74 -160 115 -58 41 -121
      86 -140 100 -19 14 -60 43 -91 65 -61 43 -268 195 -372 273 -143 107 -523 412
      -607 487 -161 144 -412 398 -479 485 -103 133 -101 130 -183 268 -69 115 -161
      322 -223 497 -10 28 -23 66 -30 85 -19 55 -61 234 -87 375 -14 81 -18 151 -18
      365 0 278 7 336 56 498 10 34 19 67 19 74 0 12 28 75 73 163 100 196 245 338
      447 436 36 17 77 38 91 45 14 7 43 18 65 23 21 5 57 16 79 25 22 8 51 15 65
      16 14 0 48 7 75 16 95 31 712 34 822 5 21 -6 79 -15 128 -21 50 -6 113 -17
      140 -25 28 -7 75 -17 105 -21 30 -3 66 -11 80 -16 14 -5 57 -16 95 -23 82 -16
      192 -43 325 -79 52 -14 123 -33 157 -40 34 -8 71 -20 82 -25 11 -6 28 -11 38
      -11 10 0 50 -9 88 -21 39 -12 99 -30 135 -40 125 -35 215 -61 260 -76 25 -8
      68 -20 95 -28 122 -34 195 -56 260 -76 78 -24 206 -59 218 -59 15 0 6 32 -16
      53 -13 12 -64 60 -113 107 -73 70 -168 157 -314 290 -10 8 -35 31 -56 51 -36
      32 -299 244 -369 296 -47 35 -307 209 -340 227 -16 9 -48 27 -70 40 -22 13
      -71 40 -110 61 -38 20 -77 40 -85 45 -29 17 -187 90 -195 90 -4 0 -26 8 -49
      19 -76 35 -227 87 -291 101 -22 5 -58 15 -80 23 -22 8 -65 18 -95 22 -30 4
      -66 12 -80 17 -14 5 -103 18 -199 29 -200 22 -429 23 -596 3z"
                />
                <path
                  className="hstroke"
                  d="M2065 9094 c-60 -7 -139 -20 -175 -28 -36 -9 -83 -18 -105 -21 -22
      -4 -66 -15 -98 -26 -31 -10 -63 -19 -70 -19 -6 -1 -30 -9 -52 -20 -22 -11 -45
      -19 -51 -20 -16 0 -180 -70 -214 -90 -8 -5 -40 -22 -70 -38 -199 -105 -439
      -308 -584 -495 -153 -197 -276 -437 -344 -672 -50 -170 -54 -191 -92 -444 -7
      -48 -10 -182 -8 -370 4 -289 10 -355 49 -551 6 -30 17 -84 24 -120 17 -86 44
      -196 60 -245 7 -22 25 -80 40 -130 15 -49 36 -108 46 -131 11 -23 19 -46 19
      -52 0 -6 7 -26 15 -44 8 -18 37 -85 64 -148 46 -107 93 -200 155 -310 14 -25
      33 -58 42 -75 32 -58 207 -314 223 -325 3 -3 36 -41 73 -85 94 -114 339 -352
      608 -592 46 -42 438 -352 537 -426 235 -176 346 -257 411 -302 131 -91 186
      -129 307 -215 66 -47 131 -93 145 -102 14 -10 77 -53 140 -97 63 -45 171 -119
      240 -165 69 -47 175 -119 235 -161 61 -42 173 -119 250 -171 77 -53 181 -124
      230 -159 50 -35 119 -84 155 -108 36 -25 82 -58 102 -74 21 -15 74 -55 118
      -88 159 -118 317 -246 469 -379 102 -89 335 -324 411 -415 131 -157 135 -144
      49 164 -11 39 -24 84 -30 100 -6 17 -15 46 -20 65 -16 56 -75 210 -109 285
      -37 80 -153 311 -176 350 -13 22 -32 56 -43 75 -20 37 -138 214 -171 258 -161
      214 -290 363 -470 543 -113 113 -245 239 -295 280 -49 41 -92 77 -95 80 -8 11
      -325 261 -385 304 -31 22 -80 58 -110 80 -30 22 -102 74 -160 115 -58 41 -121
      86 -140 100 -19 14 -60 43 -91 65 -61 43 -268 195 -372 273 -143 107 -523 412
      -607 487 -161 144 -412 398 -479 485 -103 133 -101 130 -183 268 -69 115 -161
      322 -223 497 -10 28 -23 66 -30 85 -19 55 -61 234 -87 375 -14 81 -18 151 -18
      365 0 278 7 336 56 498 10 34 19 67 19 74 0 12 28 75 73 163 100 196 245 338
      447 436 36 17 77 38 91 45 14 7 43 18 65 23 21 5 57 16 79 25 22 8 51 15 65
      16 14 0 48 7 75 16 95 31 712 34 822 5 21 -6 79 -15 128 -21 50 -6 113 -17
      140 -25 28 -7 75 -17 105 -21 30 -3 66 -11 80 -16 14 -5 57 -16 95 -23 82 -16
      192 -43 325 -79 52 -14 123 -33 157 -40 34 -8 71 -20 82 -25 11 -6 28 -11 38
      -11 10 0 50 -9 88 -21 39 -12 99 -30 135 -40 125 -35 215 -61 260 -76 25 -8
      68 -20 95 -28 122 -34 195 -56 260 -76 78 -24 206 -59 218 -59 15 0 6 32 -16
      53 -13 12 -64 60 -113 107 -73 70 -168 157 -314 290 -10 8 -35 31 -56 51 -36
      32 -299 244 -369 296 -47 35 -307 209 -340 227 -16 9 -48 27 -70 40 -22 13
      -71 40 -110 61 -38 20 -77 40 -85 45 -29 17 -187 90 -195 90 -4 0 -26 8 -49
      19 -76 35 -227 87 -291 101 -22 5 -58 15 -80 23 -22 8 -65 18 -95 22 -30 4
      -66 12 -80 17 -14 5 -103 18 -199 29 -200 22 -429 23 -596 3z"
                  pathLength="100"
                />
              </g>
              <g className="h-p">
                <path
                  className="hfill"
                  d="M7160 9681 c-131 -9 -295 -33 -421 -61 -47 -11 -94 -20 -104 -20 -10
      0 -46 -8 -79 -19 -34 -10 -81 -24 -106 -31 -299 -78 -688 -253 -960 -430 -25
      -16 -52 -33 -60 -37 -25 -13 -101 -70 -258 -194 -137 -108 -402 -365 -402
      -389 0 -21 29 -21 69 -1 22 12 45 21 52 21 6 0 25 7 42 15 18 8 50 19 72 24
      22 5 60 17 85 25 116 38 423 104 585 127 39 5 111 16 160 25 50 8 144 19 210
      24 66 5 152 14 191 19 279 40 1181 38 1394 -3 41 -8 104 -17 140 -21 36 -3 88
      -12 115 -20 28 -7 97 -26 155 -41 58 -15 114 -34 125 -41 11 -7 26 -13 34 -13
      19 0 180 -75 246 -113 131 -78 297 -229 363 -331 44 -68 49 -78 92 -163 66
      -134 99 -245 131 -448 14 -90 7 -596 -10 -645 -6 -19 -16 -66 -21 -105 -6 -38
      -17 -88 -24 -110 -7 -22 -18 -58 -24 -80 -18 -71 -40 -127 -96 -246 -14 -31
      -26 -58 -26 -62 0 -10 -125 -223 -169 -287 -111 -162 -269 -350 -420 -501 -86
      -87 -143 -138 -362 -330 -100 -87 -332 -268 -687 -536 -144 -109 -507 -397
      -583 -463 -144 -125 -377 -351 -510 -495 -62 -67 -200 -238 -248 -306 -41 -58
      -152 -225 -179 -269 -28 -47 -192 -375 -192 -386 0 -4 -8 -26 -19 -48 -22 -49
      -47 -122 -65 -191 -7 -27 -18 -60 -24 -72 -7 -12 -12 -32 -12 -45 0 -13 -7
      -48 -15 -78 -9 -30 -24 -118 -35 -195 -10 -77 -22 -154 -25 -171 -11 -50 12
      -53 51 -8 19 21 34 42 34 46 0 15 105 157 194 263 116 138 184 209 293 307 64
      56 127 114 142 127 66 61 360 287 471 364 49 33 116 81 270 189 25 17 104 72
      175 120 72 49 182 125 245 169 63 44 131 91 150 104 19 13 58 40 85 60 28 19
      66 46 85 60 34 23 67 47 186 133 32 23 80 57 105 75 25 18 77 57 116 87 40 30
      111 84 159 120 865 649 1371 1218 1659 1865 14 33 33 72 41 87 8 14 14 34 14
      43 0 10 8 36 19 59 30 67 90 272 120 416 55 255 77 582 61 880 -11 206 -56
      459 -104 585 -8 22 -15 47 -16 55 0 8 -9 33 -20 55 -11 22 -19 46 -20 53 0 8
      -6 26 -14 40 -8 15 -37 74 -65 132 -104 212 -193 338 -364 517 -94 98 -284
      254 -376 308 -9 5 -28 17 -44 28 -85 56 -409 203 -491 223 -16 4 -41 13 -55
      20 -14 8 -33 14 -41 14 -8 0 -44 9 -80 19 -91 28 -233 57 -386 81 -149 23
      -528 34 -724 21z"
                />
                <path
                  className="hstroke"
                  d="M7160 9681 c-131 -9 -295 -33 -421 -61 -47 -11 -94 -20 -104 -20 -10
      0 -46 -8 -79 -19 -34 -10 -81 -24 -106 -31 -299 -78 -688 -253 -960 -430 -25
      -16 -52 -33 -60 -37 -25 -13 -101 -70 -258 -194 -137 -108 -402 -365 -402
      -389 0 -21 29 -21 69 -1 22 12 45 21 52 21 6 0 25 7 42 15 18 8 50 19 72 24
      22 5 60 17 85 25 116 38 423 104 585 127 39 5 111 16 160 25 50 8 144 19 210
      24 66 5 152 14 191 19 279 40 1181 38 1394 -3 41 -8 104 -17 140 -21 36 -3 88
      -12 115 -20 28 -7 97 -26 155 -41 58 -15 114 -34 125 -41 11 -7 26 -13 34 -13
      19 0 180 -75 246 -113 131 -78 297 -229 363 -331 44 -68 49 -78 92 -163 66
      -134 99 -245 131 -448 14 -90 7 -596 -10 -645 -6 -19 -16 -66 -21 -105 -6 -38
      -17 -88 -24 -110 -7 -22 -18 -58 -24 -80 -18 -71 -40 -127 -96 -246 -14 -31
      -26 -58 -26 -62 0 -10 -125 -223 -169 -287 -111 -162 -269 -350 -420 -501 -86
      -87 -143 -138 -362 -330 -100 -87 -332 -268 -687 -536 -144 -109 -507 -397
      -583 -463 -144 -125 -377 -351 -510 -495 -62 -67 -200 -238 -248 -306 -41 -58
      -152 -225 -179 -269 -28 -47 -192 -375 -192 -386 0 -4 -8 -26 -19 -48 -22 -49
      -47 -122 -65 -191 -7 -27 -18 -60 -24 -72 -7 -12 -12 -32 -12 -45 0 -13 -7
      -48 -15 -78 -9 -30 -24 -118 -35 -195 -10 -77 -22 -154 -25 -171 -11 -50 12
      -53 51 -8 19 21 34 42 34 46 0 15 105 157 194 263 116 138 184 209 293 307 64
      56 127 114 142 127 66 61 360 287 471 364 49 33 116 81 270 189 25 17 104 72
      175 120 72 49 182 125 245 169 63 44 131 91 150 104 19 13 58 40 85 60 28 19
      66 46 85 60 34 23 67 47 186 133 32 23 80 57 105 75 25 18 77 57 116 87 40 30
      111 84 159 120 865 649 1371 1218 1659 1865 14 33 33 72 41 87 8 14 14 34 14
      43 0 10 8 36 19 59 30 67 90 272 120 416 55 255 77 582 61 880 -11 206 -56
      459 -104 585 -8 22 -15 47 -16 55 0 8 -9 33 -20 55 -11 22 -19 46 -20 53 0 8
      -6 26 -14 40 -8 15 -37 74 -65 132 -104 212 -193 338 -364 517 -94 98 -284
      254 -376 308 -9 5 -28 17 -44 28 -85 56 -409 203 -491 223 -16 4 -41 13 -55
      20 -14 8 -33 14 -41 14 -8 0 -44 9 -80 19 -91 28 -233 57 -386 81 -149 23
      -528 34 -724 21z"
                  pathLength="100"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

// Memoised deliberately. LoginPage keeps UserName/Password in state and renders
// <LoginScene Quiet={Typing} />, so WITHOUT this every keystroke re-rendered this
// whole subtree: ~250 SVG elements carrying 127 freshly-allocated inline style
// objects, all diffed key-by-key on the input-latency path for no DOM change at
// all. `Quiet` only flips on focus/blur, so the default shallow compare is right.
export default React.memo(LoginScene);
