defaultMetrics = [["advance", 1000], ["em", 700], 
                  ["defaultOffset", {x:-24, y:208}], ["leftmost", 141]];
var highOffset = [["defaultOffset", {x:-24, y:1750}]];
var lowOffset = [["defaultOffset", {x:-24, y:208}]];
var maxAdvance = [["advance", 1404]];
var restMetrics = [["advance", 552], ["em", 444], ["defaultOffset", {x:-108,y:208}]];
var semiminimRestMetrics = [["advance", 552], ["em", 444], ["defaultOffset", {x:-192,y:208}]];
var clefMetrics = [["defaultOffset", {x:-108,y:972}], ["advance", 500]];
var mensMetrics = [["advance", 1680], ["em", 1320], 
                   ["defaultOffset", {x:-24, y:600}], ["leftmost", 141]];
var mensMetricsb = [["advance", 1200], ["em", 800], 
                   ["defaultOffset", {x:-367, y:1200}], ["leftmost", 141]];
var solmMetrics = [["advance", 780], ["em", 660], ["defaultOffset", {x:-440,y:203}]];
var propMetrics = [["advance", 750], ["em", 530], ["defaultOffset", {x:140, y:120}]];
var thinPropMetrics = [["advance", 400], ["em", 530], ["defaultOffset", {x:140, y:120}]];

var arsNovaVoid = { 
  // Maxima
  maxima: glyphFromD("M141 1376v733h72v-92h905v92h72v-1966l-72 -82v1407h-905v-92h-72z\
                        M213 1622h905v242h-905v-242z", 
                     highOffset.concat(maxAdvance)),//[["defaultOffset", {x: -25, y: 1750}]]),
  leftMaxima: glyphFromD("M141 1376v733h72v-92h905v92h72v-1966l-72 -82v1407h-905v-92h-72z\
                           M664 1622h454v242h-454v-242z", 
                         highOffset.concat(maxAdvance)),
  rightMaxima: glyphFromD("M141 1376v733h72v-92h905v92h72v-1966l-72 -82v1407h-905v-92h-72z\
                            M213 1622h455v242h-455v-242z", 
                          highOffset.concat(maxAdvance)),
  fullMaxima: glyphFromD("M141 1376v733h72v-92h905v92h72v-1966l-72 -82v1407h-905v-92h-72z", 
                         highOffset.concat(maxAdvance)),
  upMaxima: glyphFromD("M141 -160v733h72v-92h905v1325l72 82v-2048h-72v92h-905v-92h-72z\
                        M213 86h905v242h-905v-242z", 
                       lowOffset.concat(maxAdvance)),
  upLeftMaxima: glyphFromD("M141 -160v733h72v-92h905v1325l72 82v-2048h-72v92h-905v-92h-72z\
                             M664 86h454v242h-454v-242z", 
                           lowOffset.concat(maxAdvance)),
  upRightMaxima: glyphFromD("M141 -160v733h72v-92h905v1325l72 82v-2048h-72v92h-905v-92h-72z\
                              M213 86h455v242h-455v-242z", 
                            lowOffset.concat(maxAdvance)),
  upFullMaxima: glyphFromD("M141 -160v733h72v-92h905v1325l72 82v-2048h-72v92h-905v-92h-72z", 
                           lowOffset.concat(maxAdvance)),
  // Long
  longa: glyphFromD("M86 1376v733h72v-92h452v92h72v-1966l-72 -82v1407h-452v-92h-72z\
                      M158 1622h452v242h-452v-242z", 
                    highOffset),
  leftLonga: glyphFromD("M86 1376v733h72v-92h452v92h72v-1966l-72 -82v1407h-452v-92h-72z\
                          M383 1622h227v242h-227v-242z", 
                        highOffset),
  rightLonga: glyphFromD("M86 1376v733h72v-92h452v92h72v-1966l-72 -82v1407h-452v-92h-72z\
                           M158 1622h227v242h-227v-242z", 
                         highOffset),
  fullLonga: glyphFromD("M86 1376v733h72v-92h452v92h72v-1966l-72 -82v1407h-452v-92h-72z", 
                        highOffset),
  upLonga: glyphFromD("M86 -160v733h72v-92h452v1325l72 82v-2048h-72v92h-452v-92h-72z\
                        M158 86h452v242h-452v-242z"),
  upLeftLonga: glyphFromD("M86 -160v733h72v-92h452v1325l72 82v-2048h-72v92h-452v-92h-72z\
                            M383 86h227v242h-227v-242z"),
  upRightLonga: glyphFromD("M86 -160v733h72v-92h452v1325l72 82v-2048h-72v92h-452v-92h-72z\
                             M158 86h227v242h-227v-242z"),
  upFullLonga: glyphFromD("M86 -160v733h72v-92h452v1325l72 82v-2048h-72v92h-452v-92h-72z"),
  // Breve
  breve: glyphFromD("M86 -160v733h72v-92h452v92h72v-733h-72v92h-452v-92h-72z\
                      M158 86h452v242h-452v-242z"),
  leftBreve: glyphFromD("M86 -160v733h72v-92h452v92h72v-733h-72v92h-452v-92h-72z\
                          M383 86h227v242h-227v-242z"),
  rightBreve: glyphFromD("M86 -160v733h72v-92h452v92h72v-733h-72v92h-452v-92h-72z\
                           M158 86h227v242h-227v-242z"),
  fullBreve: glyphFromD("M86 -160v733h72v-92h452v92h72v-733h-72v92h-452v-92h-72z"),
  // Semibreve
  semibreve: glyphFromD("M94 248q0 10 8 18l275 336q109 -100 196 -229q76 -106 99 -174\
                          q7 -16 7 -24q0 -3 -1 -5q0 -14 -12 -23l-289 -340\
                          q-35 45 -68 89.5t-67 91.5q-90 127 -142 231q-6 13 -6 29z\
                          M240 293q25 -86 82 -172q25 -39 49 -76t51 -76l110 146q-70 203 -186 325z"),
  fullSemibreve: glyphFromD("M94 248q0 10 8 18l275 336q109 -100 196 -229q76 -106 99 -174\
                              q7 -16 7 -24q0 -3 -1 -5q0 -14 -12 -23l-289 -340\
                              q-35 45 -68 89.5t-67 91.5q-90 127 -142 231q-6 13 -6 29z"),
  // Minim and shorter
  upMinim: glyphFromD("M94 1780q-1 2 -1 4t1 4l4 8q2 4 4 6l275 336q59 -55 109.5 -114.5\
                        t88 -115t62.5 -101.5t35 -72q4 -10 6 -18q1 -4 1 -6.5t-1 -4.5\
                        q0 -14 -12 -23l-252 -297v-1243l-72 -82v1328q-53 72 -121.5 166\
                        t-120.5 200q-6 13 -6 25z\
                        M240 1829q29 -96 81 -172t101 -152l110 146 q-31 90 -75.5 173t-110.5 152z", 
                      highOffset),
  minim: glyphFromD("M94 248q0 10 8 18l242 297v1243l72 82v-1323q201 -203 256 -366\
                       q8 -27 6 -29q0 -14 -12 -23l-289 -340q-35 45 -68 89.5t-67 91.5\
                       q-90 127 -142 231q-6 13 -6 29z\
                      M240 293q25 -86 82 -172q25 -39 49 -76t51 -76l110 146q-70 203 -186 325z"),
  semiminim: glyphFromD("M94 248q0 10 8 18l242 297v1243l72 82v-1323q201 -203 256 -366\
                          q8 -27 6 -29q0 -14 -12 -23l-289 -340q-35 45 -68 89.5\
                          t-67 91.5q-90 127 -142 231q-6 13 -6 29z"),
  upSemiminim: glyphFromD("M94 1780q-1 2 -1 4t1 4l4 8q2 4 4 6l275 336q59 -55 109.5 -114.5\
                            t88 -115t62.5 -101.5t35 -72q4 -10 6 -18q1 -4 1 -6.5t-1 -4.5\
                            q0 -14 -12 -23l-252 -297v-1243l-72 -82v1328q-53 72 -121.5 166\
                            t-120.5 200q-6 13 -6 25z", 
                          highOffset),
  fusa: glyphFromD("M94 244q0 14 8 22l242 297v1243l72 82q31 -49 83 -120.5t102 -148.5\
                     t88 -149.5t38 -123.5q0 -61 -30.5 -126t-69.5 -112q18 45 33.5 93\
                     t15.5 95q0 25 -4 45.5t-19 44.5q-18 33 -38.5 65t-43.5 62q-74 104 -155 197\
                     v-1145q33 -35 71.5 -80t74.5 -94t64.5 -99t45.5 -93 q6 -16 6 -29\
                     q0 -4 -20.5 -29.5t-51.5 -63.5t-67.5 -81t-70.5 -82t-59.5 -68.5\
                     t-31.5 -38.5q-18 27 -65.5 88.5t-95.5 131t-85 131t-37 86.5z"),
  voidSemi: glyphFromD("M94 244q0 14 8 22l242 297v1243l72 82q31 -49 83 -120.5t102 -148.5\
                         t88 -149.5t38 -123.5q0 -61 -30.5 -126t-69.5 -112q18 45 33.5 93\
                         t15.5 95q0 25 -4 45.5t-19 44.5q-18 33 -38.5 65t-43.5 62\
                         q-74 104 -155 197v-1145q33 -35 71.5 -80t74.5 -94t64.5 -99\
                         t45.5 -93 q6 -16 6 -29q0 -4 -20.5 -29.5t-51.5 -63.5t-67.5 -81\
                         t-70.5 -82t-59.5 -68.5t-31.5 -38.5q-18 27 -65.5 88.5t-95.5 131\
                         t-85 131t-37 86.5zM240 293q29 -92 80 -169t102 -155l110 146\
                         q-31 90 -75.5 173t-110.5 152z"),
  voidFusa: glyphFromD("M94 244q0 14 8 22l242 297v1243l72 82q31 -49 83 -120.5t102 -148.5\
                       t88 -149.5t38 -123.5q0 -61 -30.5 -126t-69.5 -112q18 45 33.5 93t15.5\
                       95q0 25 -4 45.5t-19 44.5q-18 33 -38.5 65t-43.5 62q-74 104 -155 197\
                       v-1145q33 -35 71.5 -80t74.5 -94t64.5 -99t45.5 -93 q6 -16 6 -29\
                       q0 -4 -20.5 -29.5t-51.5 -63.5t-67.5 -81t-70.5 -82t-59.5 -68.5\
                       t-31.5 -38.5q-18 27 -65.5 88.5t-95.5 131t-85 131t-37 86.5zM240 293\
                       q29 -92 80 -169t102 -155l110 146q-31 90 -75.5 173t-110.5 152z"),
  upFusa: glyphFromD("M94 1780q-1 2 -1 4t1 4l4 8q2 4 4 6l275 336q59 -55 109.5 -114.5\
                      t88 -115t62.5 -101.5t35 -72q6 -16 6 -29q0 -14 -12 -23l-252 -297v-1146\
                      q82 92 155 196q23 31 43.5 62.5t38.5 64.5q14 25 18.5 45.5t4.5 44.5\
                      q0 47 -15.5 95.5t-33.5 93.5q39 -47 69.5 -110.5 t30.5 -127.5q0 -51 -38 -123.5\
                      t-88 -149.5t-102.5 -148.5t-82.5 -121.5l-72 82v1272q-53 72 -121.5 153\
                      t-120.5 187q-6 13 -6 25z", highOffset),
  upVoidFusa: glyphFromD("M94 1780q-1 2 -1 4t1 4l4 8q2 4 4 6l275 336q59 -55 109.5 -114.5t88 -115\
                       t62.5 -101.5t35 -72q6 -16 6 -29q0 -14 -12 -23l-252 -297v-1146q82 92 155 196\
                       q23 31 43.5 62.5t38.5 64.5q14 25 18.5 45.5t4.5 44.5q0 47 -15.5 95.5\
                       t-33.5 93.5q39 -47 69.5 -110.5 t30.5 -127.5q0 -51 -38 -123.5t-88 -149.5\
                       t-102.5 -148.5t-82.5 -121.5l-72 82v1272q-53 72 -121.5 153t-120.5 187\
                       q-6 13 -6 25zM240 1829q29 -96 81 -172t101 -152l110 146\
                       q-31 90 -75.5 173t-110.5 152z", highOffset),
	semifusa: glyphFromD("M94 244q0 14 8 22l242 297v1243l72 82q29 -47 81 -118.5t103 -148.5t89 -150.5t38 -124.5q0 -43 -16.5 -86t-38.5 -84q25 -47 40 -86t15 -72q0 -63 -30.5 -126t-69.5 -112q18 45 33.5 92.5t15.5 96.5q0 29 -5 47t-18 43q-43 84 -108.5 169t-128.5 154v-817 q35 -35 72.5 -80t73.5 -93t64.5 -98t45.5 -95q6 -16 6 -29q0 -4 -19.5 -29.5t-50 -62.5t-67.5 -80t-71 -82t-59.5 -68.5t-33.5 -40.5q-14 18 -40 53.5t-57.5 78.5t-64.5 90t-59.5 89t-44 76t-17.5 50zM416 1561q18 -31 48 -73t63.5 -90t68.5 -99.5t63 -100.5q16 49 17 98 q0 29 -5 47.5t-18 42.5q-45 84 -109.5 168t-127.5 156v-149z"),
	upSemifusa: glyphFromD("M94 1780q-1 2 -1 4t1 4l4 8q2 4 4 6l275 336q59 -55 109.5 -114.5t88 -115t62.5 -101.5t35 -72q6 -16 6 -29q0 -14 -12 -23l-252 -297v-819q63 70 128.5 155t108.5 169q12 25 17.5 43t5.5 47q0 49 -15.5 96t-33.5 92q39 -49 69.5 -111.5t30.5 -125.5q0 -31 -15.5 -71 t-39.5 -85q23 -41 39 -85t16 -87q0 -51 -38 -124.5t-89 -150.5t-103.5 -148.5t-80.5 -119.5l-72 82v1272q-53 72 -121.5 153t-120.5 187q-6 13 -6 25zM414 240q63 72 127.5 155.5t109.5 167.5q12 25 17.5 43.5t5.5 46.5q0 47 -17 101q-29 -49 -63.5 -100.5t-68 -100.5 t-63.5 -91t-48 -73v-149z", highOffset),
  breveRest: glyphFromD("M348 -31v475h72v-475h-72z", restMetrics),
  semibreveRest: glyphFromD("M348 145v299h72v-217z", restMetrics),
  minimRest: glyphFromD("M348 -31v217l72 82v-299h-72z", restMetrics),
  semiminimRest: glyphFromD("M348 -31v217l150 168l129 -153l-35 -37l-129 98l-43 -45v-248h-72z", semiminimRestMetrics),
  fusaRest: glyphFromD("M348 -31v217l150 168l129 -153l-35 -37l-129 98l-17 -20\
                         l105 -123l-29 -33l-102 70v-187h-72z", 
                       restMetrics),
  custos: glyphFromD("M154 35l174 344q4 -66 26.5 -117t48.5 -110l132 227q0 -66 25.5 -118\
                       t53.5 -109q86 145 172 287.5t175 287.5q14 23 29.5 43.5t31.5 42.5\
                       q31 39 69.5 83t83 82t94.5 65.5t103 35.5q14 2 26.5 3t26.5 1\
                       q82 0 132.5 -55t50.5 -135q0 -35 -8.5 -70t-18.5 -69v30 \
                       q0 72 -29.5 135.5t-101.5 90.5q-10 4 -15 5t-9.5 2t-10.5 1\
                       t-20 4q-6 2 -20.5 1t-20.5 -1q-47 0 -99.5 -33t-100.5 -80t-89 -98\
                       t-66 -88q-115 -166 -218 -340l-206 -348q-29 47 -53 103.5t-35 111.5\
                       l-125 -215q-29 59 -46 103t-23 112l-111 -215h-28z", [["em", 500]]),
  CClef: glyphFromD("M264 481v987h322v-389h-250v-209h250v-389h-322z\
                     M336 635h199v82h-199v-82zM336 1233h199v82h-199v-82z", clefMetrics),
  CFullClef: glyphFromD("M264 481v987h322v-389h-250v-209h250v-389h-322z", clefMetrics),
  FClef: glyphFromD("M86 1120v733h72v-92h452v92h72v-1966l-72 -82v1407h-452v-92h-72z\
                     M158 1366h452v242h-452v-242z\
                     M872 1245q-4 8 -3 16q0 10 5 19l156 197q18 -18 45 -48t52.5 -64\
                      t47 -69.5t29.5 -66.5q6 -16 -8 -25l-139 -170v-712l-49 -68v782\
                      q-37 51 -72 101.5t-64 107.5z\
                     M872 1739 q-4 10 -4 18.5t4 16.5l136 170v346l49 57v-403q16 -16 38.5 -43\
                      t44 -58t40 -61.5t24.5 -57.5q2 -4 2 -10q0 -10 -10 -16l-166 -201\
                      q-18 27 -37.5 53.5t-40.5 55.5q-23 31 -43.5 64.5t-36.5 68.5z\
                     M961 1290q16 -51 42.5 -92t55.5 -84l55 76q-16 49 -39.5 94t-58.5 84z\
                      M961 1784q16 -51 41.5 -92t54.5 -84l57 75q-16 49 -39.5 94.5t-58.5 84.5z", 
                    [["defaultOffset", {x:240,y:1488}], ["advance", 1600]]),
  FFullClef: glyphFromD("M86 1120v733h72v-92h452v92h72v-1966l-72\
                         -82v1407h-452v-92h-72zM872 1245q-4 8 -3 16q0 10 5 19l156 197q18\
                         -18 45 -48t52.5 -64t47 -69.5t29.5 -66.5q6 -16 -8 -25l-139\
                         -170v-712l-49 -68v782q-37 51 -72 101.5t-64 107.5zM872 1739q-4\
                         10 -4 18.5t4 16.5l136 170 v346l49 57v-403q16 -16 38.5 -43t44\
                         -58t40 -61.5t24.5 -57.5q2 -4 2 -10q0 -10 -10 -16l-166 -201q-18\
                         27 -37.5 53.5t-40.5 55.5q-23 31 -43.5 64.5t-36.5 68.5z",
                    [["defaultOffset", {x:240,y:1488}], ["advance", 1600]]),
  GClef: glyphFromD("M172 104c-28 -79 -15 -147 2 -223l-11 -19c-27 79 -37 154 -8 245\
                     c-14 1 -27 0 -40 -5c-57 -20 -84 -94 -57 -164s94 -110 150 -90\
                     c34 12 42 34 44 54c3 36 -30 60 -72 43v0l22 40c63 17 91 -20 93 -60\
                     c3 -50 -45 -113 -133 -113c-90 0 -162 73 -162 163s72 163 162 163\
                     h4c1 4 3 7 4 10c17 40 32 77 32 120c0 53 -14 111 -43 182\
                     c-28 -45 -60 -92 -96 -141c-35 -47 -68 -107 -68 -147c0 -26 10 -36 23 -30\
                     l4 -7c-6 -11 -17 -18 -32 -18s-27 14 -27 34c0 50 36 111 86 181\
                     c40 56 74 106 101 151c-19 45 -43 95 -72 152c-26 47 -38 90 -38 127\
                     c0 116 90 183 160 183c48 0 95 -37 95 -117c0 -70 -27 -177 -107 -318\
                     c35 -89 47 -152 47 -202c0 -60 -20 -103 -45 -153c-2 -3 -3 -6 -4 -9\
                     c37 -5 69 -23 94 -48l-22 -60c-18 39 -51 67 -86 76z\
                     M179 522c72 129 97 221 97 280c0 68 -28 98 -66 98c-52 0 -115 -58 -115 -148\
                     c0 -34 10 -74 33 -120c20 -41 37 -77 51 -110z", 
                    [["advance", 500], ["em", 340],["defaultOffset", {x:120, y: 0}]]),
  GammaClef: glyphFromD("M92 246v51h561l23 -209h-21q-25 76 -63 105q-41 35 -98 34h-109\
                     q-45 0 -57 -12q-14 -8 -15 -57v-394q0 -53 23 -71q23 -20 86 -21\
                     v-51h-330v51q66 4 84 17q20 18 21 75v379q0 61 -21 82q-18 20 -78 21h-6z",
                        [["advance", 800], ["em", 500], ["defaultOffset", {x:160, y:0}]]),
  GClefAN: glyphFromD("M31 -215q66 66 136.5 124t144 103t151.5 71t158 26q47 0 93 -10.5t91 -26.5\
                      q-35 49 -55.5 104t-32.5 113q-20 -29 -39 -50.5t-41.5 -37t-49 -23.5t-63.5 -8\
                      q-27 0 -45 30.5t-30.5 71.5t-17.5 82t-5 60q0 43 5 86t15 84q-29 -4 -46 -11.5\
                      t-60 -19.5l-18 -4 q33 29 66.5 56.5t74.5 41.5l12 33l109 63q-8 -20 -15.5 -40.5\
                      t-13.5 -43.5h16q35 0 70 -3t70 -5q2 20 3 40t1 42l94 55l2 -36q0 -25 -2 -50.5\
                      t-6 -50.5q39 0 77 2t76 6v15q0 43 16.5 84t46.5 72.5t69.5 51t82.5 19.5\
                      q20 0 46 -5t48.5 -15.5t38 -27.5t15.5 -44 q0 -37 -29.5 -70.5t-70.5 -60.5\
                      t-86.5 -46.5t-75.5 -25.5q10 -78 32.5 -152.5t62.5 -137t99.5 -105.5t139.5 -53\
                      q27 -4 50 -5t50 10t61.5 38.5t83.5 83.5q-41 -68 -77.5 -107t-73.5 -57.5\
                      t-72 -21.5t-70 1q-86 10 -152.5 58.5t-113.5 117t-74.5 152.5t-35.5 166 \
                      q-43 -4 -86 -7t-84 -5q-4 -18 -4 -38v-38q0 -72 12 -154t39.5 -158.5t74 -141\
                      t111.5 -101.5q27 -14 49.5 -24.5t44.5 -28.5l-90 -54q-23 8 -41 19.5t-39 21.5\
                      q-31 14 -81 39t-105 47.5t-107.5 39t-87.5 16.5q-76 0 -143.5 -22.5t-130.5 -57.5\
                      t-125.5 -77t-126.5 -79z \
                     M522 442q0 -23 1 -57.5t9.5 -66t24.5 -55t47 -23.5q12 0 26.5 11t30 26.5t27.5 32\
                      t21 24.5q-12 68 -13 139q0 53 6 107q-41 0 -81 2l-82 4q-8 -35 -12.5 -71t-4.5 -73z\
                     M1051 685q0 -7 2 -17q25 2 54.5 6t55 15t43 32.5t17.5 56.5q0 16 -11.5 26.5\
                      t-27 16.5t-32.5 7t-30 1 l-26 -2q-23 -25 -34 -58.5t-11 -68.5v-15z", 
                    clefMetrics),
  CClefChant: glyphFromD("M264 481v987h322v-389h-250v-209h250v-389h-322z", clefMetrics),
  FClefChant: glyphFromD("M86 1120v733h72v-92h452v92h72v-1966l-72 -82v1407h-452v-92h-72zM872 1245q-4 8 -3 16q0 10 5 19l156 197q18 -18 45 -48t52.5 -64t47 -69.5t29.5 -66.5q6 -16 -8 -25l-139 -170v-712l-49 -68v782q-37 51 -72 101.5t-64 107.5zM872 1739q-4 10 -4 18.5t4 16.5l136 170 v346l49 57v-403q16 -16 38.5 -43t44 -58t40 -61.5t24.5 -57.5q2 -4 2 -10q0 -10 -10 -16l-166 -201q-18 27 -37.5 53.5t-40.5 55.5q-23 31 -43.5 64.5t-36.5 68.5z", 
                         [["defaultOffset", {x:-108, y:1500}], ["advance", 1440]]),
                         //clefMetrics),
  GClefChant: glyphFromD("M31 -215q66 66 136.5 124t144 103t151.5 71t158 26q47 0 93 -10.5t91 -26.5q-35 49 -55.5 104t-32.5 113q-20 -29 -39 -50.5t-41.5 -37t-49 -23.5t-63.5 -8q-27 0 -45 30.5t-30.5 71.5t-17.5 82t-5 60q0 43 5 86t15 84q-29 -4 -46 -11.5t-60 -19.5l-18 -4 q33 29 66.5 56.5t74.5 41.5l12 33l109 63q-8 -20 -15.5 -40.5t-13.5 -43.5h16q35 0 70 -3t70 -5q2 20 3 40t1 42l94 55l2 -36q0 -25 -2 -50.5t-6 -50.5q39 0 77 2t76 6v15q0 43 16.5 84t46.5 72.5t69.5 51t82.5 19.5q20 0 46 -5t48.5 -15.5t38 -27.5t15.5 -44 q0 -37 -29.5 -70.5t-70.5 -60.5t-86.5 -46.5t-75.5 -25.5q10 -78 32.5 -152.5t62.5 -137t99.5 -105.5t139.5 -53q27 -4 50 -5t50 10t61.5 38.5t83.5 83.5q-41 -68 -77.5 -107t-73.5 -57.5t-72 -21.5t-70 1q-86 10 -152.5 58.5t-113.5 117t-74.5 152.5t-35.5 166 q-43 -4 -86 -7t-84 -5q-4 -18 -4 -38v-38q0 -72 12 -154t39.5 -158.5t74 -141t111.5 -101.5q27 -14 49.5 -24.5t44.5 -28.5l-90 -54q-23 8 -41 19.5t-39 21.5q-31 14 -81 39t-105 47.5t-107.5 39t-87.5 16.5q-76 0 -143.5 -22.5t-130.5 -57.5t-125.5 -77t-126.5 -79z M522 442q0 -23 1 -57.5t9.5 -66t24.5 -55t47 -23.5q12 0 26.5 11t30 26.5t27.5 32t21 24.5q-12 68 -13 139q0 53 6 107q-41 0 -81 2l-82 4q-8 -35 -12.5 -71t-4.5 -73zM1051 685q0 -7 2 -17q25 2 54.5 6t55 15t43 32.5t17.5 56.5q0 16 -11.5 26.5t-27 16.5t-32.5 7t-30 1 l-26 -2q-23 -25 -34 -58.5t-11 -68.5v-15z", 
                         [["defaultOffset", {x:-108, y:348}], ["advance", 1440]]),
  oMens: glyphFromD("M106 637q0 131 47.5 247.5t130.5 207t194.5 146.5t242.5 67v22q0 49 -12.5 72.5\
                      t-31 32t-39 3.5t-38.5 -12l-18 27q29 16 53 32.5t59 45.5q39 29 56.5 44t37.5 38\
                      h60q-2 -8 -5 -19.5t-6 -40t-4.5 -81t-1.5 -142.5v-22q129 -10 241 -65.5\
                      t195 -145.5t130 -207t47 -250 q0 -131 -47 -248t-129 -207t-194.5 -146t-242.5 -67\
                      v-22q0 -74 4.5 -113t12.5 -55l-143 -82q4 6 6 16.5t5 36t4 72.5t1 125\
                      v22q-129 10 -241.5 65.5t-195.5 145.5t-130.5 207t-47.5 250zM301 698\
                      q2 -108 43 -217q55 -141 156.5 -238.5t220.5 -131.5v1073h-10\
                      q-63 0 -131 -23 q-88 -31 -151.5 -100.5t-96.5 -162.5q-31 -88 -31 -188\
                      v-12zM831 92q70 0 130 21q90 31 152.5 99.5t94.5 160.5q32 89 32 194v7\
                      q-1 108 -42 219q-51 141 -149.5 238t-217.5 134v-1073z", 
                    mensMetrics),
  cMens: glyphFromD("M106 637q0 131 47.5 247.5t130.5 207t194.5 146.5t242.5 67v22\
                      q0 49 -12.5 72.5t-31 32t-39 3.5t-38.5 -12l-18 27q29 16 53 32.5\
                      t59 45.5q39 29 56.5 44t37.5 38h60q-2 -8 -5 -19.5t-6 -40t-4.5 -81\
                      t-1.5 -142.5v-22q147 -12 281.5 -88t218.5 -209l-133 -215\
                      q-51 141 -149.5 237t-217.5 133v-1071h17q92 0 165.5 17.5\
                      t132 50.5t103.5 79t82 103v-78q-86 -131 -218 -206.5t-282 -88.5\
                      v-22q0 -74 4.5 -113t12.5 -55l-143 -82q4 6 6 16.5t5 36t4 72.5t1 125\
                      v22q-129 10 -241.5 65.5t-195.5 145.5t-130.5 207t-47.5 250zM304 698\
                      q1 -108 40 -217q53 -147 153.5 -241.5t223.5 -128.5v1073q-35 0 -71 -5\
                      t-70 -18q-88 -31 -150.5 -100.5t-94.5 -161.5q-31 -89 -31 -194v-7z", 
                    mensMetrics),
  OMens: glyphFromD("M106 637q0 139 52.5 261t143.5 213t213 143.5t261 52.5t261 -52.5t212 -143.5t142.5 -213t52.5 -261t-52.5 -261t-142.5 -213t-212 -143.5t-261 -52.5t-261 52.5t-213 143.5t-143.5 213t-52.5 261zM301 698q2 -108 43 -217q41 -106 110.5 -189t152.5 -132q83 -50 175 -64\
q29 -5 58 -4q62 0 121 21q90 31 152.5 99.5t94.5 160.5q32 89 32 194v7q-1 108 -42 219q-39 109 -106.5 190.5t-151.5 131.5q-84 49 -177 63q-28 4 -56 5q-64 0 -127 -22q-88 -31 -151.5 -100.5t-96.5 -162.5q-31 -88 -31 -188v-12z", mensMetrics),
  CMens: glyphFromD("M106 637q0 139 52.5 261t143.5 213t213 143.5t261 52.5q164 0 313.5 -77t241.5 -222l-133 -215q-39 109 -107.5 190.5t-152.5 131.5q-84 49 -176 63q-28 4 -56 5q-64 0 -126 -22q-88 -31 -150.5 -100.5t-94.5 -161.5q-31 -89 -31 -194v-7q1 -108 40 -217\
q35 -92 88 -164.5t119.5 -122t142.5 -76t154 -26.5q92 0 165.5 17.5t132 50.5t103.5 79t82 103v-78q-45 -72 -107.5 -127t-134 -93t-151.5 -57.5t-162 -19.5q-139 0 -261 52.5t-213 143.5t-143.5 213t-52.5 261z", mensMetrics),
  ØMens: glyphFromD("M106 637q0 139 52.5 261t143.5 213t213 143.5t261 52.5t261 -52.5t212 -143.5t142.5 -213t52.5 -261t-52.5 -261t-142.5 -213t-212 -143.5t-261 -52.5t-261 52.5t-213 143.5t-143.5 213t-52.5 261zM301 697.5q2 -107.5 43 -216.5q41 -106 110.5 -189t152.5 -132\
t175 -63.5t179 16.5q90 31 152.5 99.5t95 160.5t31.5 200.5t-42 219.5q-39 109 -106.5 191.5t-151.5 132.5t-177 63.5t-183 -19.5q-88 -31 -151.5 -100.5t-96.5 -162.5t-31 -200.5zM625 637q0 47 24.5 83t77.5 64l49 2q72 0 118 -40.5t46 -100.5q0 -33 -15.5 -61.5t-40 -50\
t-58 -34t-70.5 -12.5q-57 0 -94 42t-37 108z", mensMetrics),
  øMens: glyphFromD("M106 637q0 131 47.5 247.5t130.5 207t194.5 146.5t242.5 67v22q0 49 -12.5 72.5\
                      t-31 32t-39 3.5t-38.5 -12l-18 27q29 16 53 32.5t59 45.5q39 29 56.5 44t37.5 38\
                      h60q-2 -8 -5 -19.5t-6 -40t-4.5 -81t-1.5 -142.5v-22q129 -10 241 -65.5\
                      t195 -145.5t130 -207t47 -250 q0 -131 -47 -248t-129 -207t-194.5 -146t-242.5 -67\
                      v-22q0 -74 4.5 -113t12.5 -55l-143 -82q4 6 6 16.5t5 36t4 72.5t1 125\
                      v22q-129 10 -241.5 65.5t-195.5 145.5t-130.5 207t-47.5 250zM301 698\
                      q2 -108 43 -217q55 -141 156.5 -238.5t220.5 -131.5v1073h-10\
                      q-63 0 -131 -23 q-88 -31 -151.5 -100.5t-96.5 -162.5q-31 -88 -31 -188\
                      v-12zM831 92q70 0 130 21q90 31 152.5 99.5t94.5 160.5q32 89 32 194v7\
                      q-1 108 -42 219q-51 141 -149.5 238t-217.5 134v-1073z\
                      M625 637q0 47 24.5 83t77.5 64l49 2q72 0 118 -40.5t46 -100.5\
                      q0 -33 -15.5 -61.5t-40 -50\
                      t-58 -34t-70.5 -12.5q-57 0 -94 42t-37 108z", 
                    mensMetrics),
  ÇMens: glyphFromD("M106 637q0 139 52.5 261t143.5 213t213 143.5t261 52.5q164 0 313.5 -77t241.5 -222l-133 -215q-39 109 -107.5 190.5t-152.5 131.5t-176 63.5t-182 -17.5q-88 -31 -150.5 -100.5t-94.5 -161.5t-31 -200.5t40 -217.5q35 -92 88 -164.5t119.5 -122t142.5 -76t154 -26.5\
q92 0 165.5 17.5t132 50.5t103.5 79t82 103v-78q-45 -72 -107.5 -127t-134 -93t-151.5 -57.5t-162 -19.5q-139 0 -261 52.5t-213 143.5t-143.5 213t-52.5 261zM625 637q0 47 24.5 83t77.5 64l49 2q72 0 118 -40.5t46 -100.5q0 -33 -15.5 -61.5t-40 -50t-58 -34t-70.5 -12.5\
q-57 0 -94 42t-37 108z", mensMetrics),
  çMens: glyphFromD("M106 637q0 131 47.5 247.5t130.5 207t194.5 146.5t242.5 67v22\
                      q0 49 -12.5 72.5t-31 32t-39 3.5t-38.5 -12l-18 27q29 16 53 32.5\
                      t59 45.5q39 29 56.5 44t37.5 38h60q-2 -8 -5 -19.5t-6 -40t-4.5 -81\
                      t-1.5 -142.5v-22q147 -12 281.5 -88t218.5 -209l-133 -215\
                      q-51 141 -149.5 237t-217.5 133v-1071h17q92 0 165.5 17.5\
                      t132 50.5t103.5 79t82 103v-78q-86 -131 -218 -206.5t-282 -88.5\
                      v-22q0 -74 4.5 -113t12.5 -55l-143 -82q4 6 6 16.5t5 36t4 72.5t1 125\
                      v22q-129 10 -241.5 65.5t-195.5 145.5t-130.5 207t-47.5 250zM304 698\
                      q1 -108 40 -217q53 -147 153.5 -241.5t223.5 -128.5v1073q-35 0 -71 -5\
                      t-70 -18q-88 -31 -150.5 -100.5t-94.5 -161.5q-31 -89 -31 -194v-7z\
                      M625 637q0 47 24.5 83t77.5 64l49 2q72 0 118 -40.5t46 -100.5q0 -33 -15.5 -61.5t-40 -50\
t-58 -34t-70.5 -12.5q-57 0 -94 42t-37 108z", 
                    mensMetrics),
  QMens: glyphFromD("M367 1458q55 102 156.5 145.5t211.5 43.5q94 0 174 -30t138.5 -84t90 -132\
t31.5 -174q0 -92 -28.5 -168t-80.5 -130.5t-126 -84t-166 -29.5q-55 0 -115.5 15.5\
t-114 44t-93 69.5t-54.5 92q27 -35 66 -65.5t84 -53t93 -37t95 -14.5q84 0 145.5 36\
t101.5 93.5t58.5 130 t18.5 146.5q0 70 -18.5 129t-54.5 103t-91 69.5t-129 25.5\
q-117 0 -196 -61t-107 -176zM367 1458l90 -96z", mensMetricsb),
  qMens: glyphFromD("M367 1458q55 102 156.5 145.5t211.5 43.5q94 0 174 -30t138.5 -84t90 -132\
t31.5 -174q0 -92 -28.5 -168t-80.5 -130.5t-126 -84t-166 -29.5q-55 0 -115.5 15.5\
t-114 44t-93 69.5t-54.5 92q27 -35 66 -65.5t84 -53t93 -37t95 -14.5q84 0 145.5 36\
t101.5 93.5t58.5 130 t18.5 146.5q0 70 -18.5 129t-54.5 103t-91 69.5t-129 25.5\
q-117 0 -196 -61t-107 -176zM367 1458l90 -96z "
                    + "M664 1888h139v-1470q0 -82 -16.5 -144.5t-43.5 -103.5h-2v1595q0 39 -27 76t-50 47z",
                     mensMetricsb),
  ŒMens: glyphFromD("M367 1458q55 102 156.5 145.5t211.5 43.5q94 0 174 -30t138.5 -84t90 -132\
t31.5 -174q0 -92 -28.5 -168t-80.5 -130.5t-126 -84t-166 -29.5q-55 0 -115.5 15.5\
t-114 44t-93 69.5t-54.5 92q27 -35 66 -65.5t84 -53t93 -37t95 -14.5q84 0 145.5 36\
t101.5 93.5t58.5 130 t18.5 146.5q0 70 -18.5 129t-54.5 103t-91 69.5t-129 25.5\
q-117 0 -196 -61t-107 -176zM367 1458l90 -96z"
+"M698 1233q0 31 22.5 53.5t53.5 22.5q33 0 54.5 -22.5t21.5 -53.5q0 -33 -21.5 -54.5t-54.5 -21.5q-31 0 -53.5 21.5t-22.5 54.5z", mensMetricsb),
  œMens: glyphFromD("M367 1458q55 102 156.5 145.5t211.5 43.5q94 0 174 -30t138.5 -84t90 -132\
t31.5 -174q0 -92 -28.5 -168t-80.5 -130.5t-126 -84t-166 -29.5q-55 0 -115.5 15.5\
t-114 44t-93 69.5t-54.5 92q27 -35 66 -65.5t84 -53t93 -37t95 -14.5q84 0 145.5 36\
t101.5 93.5t58.5 130 t18.5 146.5q0 70 -18.5 129t-54.5 103t-91 69.5t-129 25.5\
q-117 0 -196 -61t-107 -176zM367 1458l90 -96z "
                    + "M664 1888h139v-1470q0 -82 -16.5 -144.5t-43.5 -103.5h-2v1595q0 39 -27 76t-50 47z"
                    +"M698 1233q0 31 22.5 53.5t53.5 22.5q33 0 54.5 -22.5t21.5 -53.5q0 -33 -21.5 -54.5t-54.5 -21.5q-31 0 -53.5 21.5t-22.5 54.5z",
                     mensMetricsb),
  '0Mens': glyphFromD("M6 127q0 104 49 170q53 66 133 65q82 0 131 -65q51 -63 52 -170q0 -106 -49 -172\
q-51 -63 -132 -64q-84 0 -133 64q-51 63 -51 172zM80 127q0 -98 29 -152q31 -51 79 -51q53 0 80 51q29 49 29 152\
q0 96 -29 149q-31 53 -78 54q-51 0 -79 -54q-29 -49 -29 -149h-2z", propMetrics),
  '1Mens': glyphFromD("M76 301v21q14 2 29.5 4t31.5 6t33.5 8t36.5 8h18v-389\
q0 -25 19 -33q20 -10 57 -10v-25h-219v25q41 2 57 12t17 31v289q0 31 -13 43q-12 12 -45 12h-14\
q-2 0 -4 -1t-4 -1z", thinPropMetrics),
  '2Mens': glyphFromD("M14 -61q135 96 191 161q55 63 55 133q0 43 -24 68q-23 23 -68 23\
q-37 0 -64 -19q-27 -18 -26 -43q0 -10 12 -24q10 -12 10 -27q0 -16 -12 -25q-14 -10 -27 -10\
q-18 0 -30 14t-13 39q0 53 48 90q45 37 116 37q70 0 111 -34q43 -37 43 -93q0 -53 -58.5 -117.5 \
t-173.5 -152.5l-18 -14h147q45 0 68 18q25 20 35 60l26 -7l-30 -125h-314z", propMetrics),
  '3Mens': glyphFromD("M14 -4q0 20 13 33q12 12 28 12t27 -10q10 -10 10 -25q0 -10 -2 -16q-4 -12 -4 -15\
q0 -20 27 -36q23 -14 65 -15q53 0 80 27q29 29 29 78q0 51 -31 82q-27 27 -88 26h-21q-4 0 -8 -1t-8 -1\
v29h8h23q53 0 78 22q27 25 26 66q0 41 -22 61q-27 23 -64 23q-31 0 -57 -17 q-25 -16 -25 -34q0 -4 6 -17\
q6 -12 7 -22q0 -14 -11 -25q-8 -8 -24 -8q-20 0 -29 10q-10 14 -10 31q0 43 45 78q41 33 106 33q63 0 109 -33\
q41 -29 41 -80q0 -37 -25 -62q-27 -27 -75 -38q63 -10 94 -39q31 -31 30 -80q0 -61 -53 -103q-51 -39 -139 -39\
q-66 0 -111 31 t-45 74z", propMetrics),
  '4Mens': glyphFromD("M0 45q31 41 59.5 80t57.5 76t53.5 74.5t46.5 72.5h64v-293h96l-17 -39h-79v-57\
q0 -25 12 -33q10 -6 51 -10v-25h-192v25q37 2 49 12q12 8 12 29v59h-199zM47 55h166v232q-18 -27 -49 -71\
t-78 -107z", propMetrics),
  '5Mens': glyphFromD("M14 -12q0 16 11 30q12 12 30 13q18 0 27 -8q12 -10 12 -27q0 -10 -2 -19\
q-6 -12 -6 -14q0 -18 23 -31q25 -12 57 -12q57 0 86 35q35 39 35 94q0 49 -33 86q-33 33 -82 33\
q-33 0 -55 -14q-27 -14 -45 -45l-29 8v39q0 18 2 39v84v77h191q29 0 38 6q12 6 19 19h26l-12 -78 h-221\
v-47v-19q0 -9 -2 -20v-49h-2q31 20 55 29q16 4 29.5 7t30.5 3q72 0 118 -43q47 -41 47 -107q0 -74 -51 -120\
q-51 -45 -141 -46q-66 0 -111 29q-45 27 -45 68z", propMetrics),
  '6Mens': glyphFromD("M10 109q0 119 53 188q55 68 148 68q57 0 98 -25q39 -23 39 -59q0 -20 -6 -27\
q-10 -8 -27 -8q-12 0 -20 6q-12 6 -14 16q-4 4 -4.5 10.5t-2.5 12.5v16q-4 8 -24 19q-18 8 -41 8\
q-59 0 -90 -51q-33 -51 -33 -144v-6h-2q27 31 57 45q37 16 68 17q70 0 110 -41 q47 -43 48 -107\
q0 -70 -50 -113q-53 -43 -127 -43q-84 0 -129 58q-51 62 -51 160zM86 41q0 -53 27 -86q27 -31 73 -31\
q49 0 76 33q31 35 31 86q0 27 -8.5 47.5t-20.5 36.5q-29 31 -71 31q-47 0 -76 -33\
q-29 -29 -29 -84h-2z", propMetrics),
  '7Mens': glyphFromD("M14 236l19 112h321l8 -39q-47 -63 -80.5 -119.5\
t-56.5 -105.5q-47 -98 -49 -193h-86h-2q18 100 70 193q29 47 65.5 100.5t89.5 110.5h-180\
q-39 0 -59 -14q-23 -12 -35 -50z", propMetrics),
  '8Mens': glyphFromD("M8 20q0 41 27 72q25 25 84 45q-43 14 -64 41q-20 23 -20 60\
q0 57 43 92q47 35 119 35q68 0 108 -31q43 -31 43 -78q0 -31 -24 -59q-25 -25 -72 -37\
q63 -20 88 -49q29 -29 29 -70q0 -61 -52 -107q-53 -43 -131 -43t-127 37q-51 37 -51 92zM68 20\
q0 -45 32 -73 q33 -27 84 -27q55 0 88 27q35 25 35 65q0 33 -40 54.5t-109 56.5l-4 2q-41 -12 -62 -39\
q-24 -29 -24 -66zM92 258q0 -29 29 -49q27 -18 100 -37h-2q41 16 55 35q20 25 21 51q0 37 -27 59\
q-29 23 -69 23q-45 0 -74 -23q-33 -22 -33 -59z", propMetrics),
  '9Mens': glyphFromD("M10 209q0 70 49 113q51 43 129 43q82 0 129 -60q49 -59 50 -158\
q0 -119 -54 -188q-55 -68 -145 -68q-61 0 -100 25q-41 23 -41 59q0 14 8 27q8 8 26 8\
q10 0 21 -6q10 -6 14 -18q4 -4 4 -9.5t2 -11.5v-16q4 -8 25 -19q18 -8 41 -8q57 0 90 51\
q35 51 35 144v6 q-33 -33 -60 -47q-29 -14 -65 -15q-66 0 -111 41q-47 41 -47 107zM84 213\
q0 -51 27 -84q27 -31 73 -31q49 0 76 33q29 31 29 88h2q0 49 -27 82q-29 31 -74 31q-47 0 -75 -33\
q-31 -31 -31 -86z", propMetrics),
  bSolm: glyphFromD("M440 66v1255l52 41v-1004q27 8 52 13.5t54 5.5q80 0 125 -49t45 -127q0 -51 -17.5 -89t-48 -62.5t-72.5 -37t-89 -12.5q-2 0 -14.5 3t-16.5 3zM492 90l38 -55h17q6 0 12 -1q69 0 104 45q38 48 37 122q0 59 -46 98t-101 39q-27 0 -61 -10v-238z", solmMetrics),
  hSolm: glyphFromD("M326 29l41 51l41 6v221l-82 -12l41 51l41 6v482l51 40v-514l174 27v21l51 41v-54l82 13l-41 -52l-41 -6v-221l82 12l-41 -51l-41 -6v-504l-51 -41v537l-174 -27v-41l-51 -41v74zM459 94l174 27v221l-174 -27v-221z", solmMetrics),
  xSolm: glyphFromD("M215 -16l41 92l117 28v148l-158 -39l41 94l117 29v375l51 41v-404l133 31v366l51 41v-395l158 39l-41 -92l-117 -29v-149l158 39l-41 -93l-117 -28v-352l-51 -41v381l-133 -31v-344l-51 -41v373zM424 117l133 30v150l-133 -33v-147z", solmMetrics),
  sigCong:   glyphFromD("M123 1081q0 23 17.5 40.5t39.5 17.5q23 0 40.5 -17.5t17.5 -40.5t-17.5 -40t-40.5 -17t-40 17t-17 40zM242 1536q0 51 7 92t22.5 76t37 67.5t51.5 69.5q37 47 84.5 76t106.5 29q63 0 110.5 -32t47.5 -102q0 -27 -8.5 -51t-20.5 -47q-29 -53 -59.5 -98t-77.5 -80 q16 23 28.5 41t22.5 35q10 18 18 35q2 4 4 21.5t2 21.5q0 31 -6 49t-28 39l-11 10v2q-25 6 -51 12t-67 2q-29 -2 -59.5 -12t-53.5 -29q-12 -55 -12 -112q0 -39 6 -84t20.5 -88t37 -82t52.5 -66l-75 -133q-35 29 -58.5 69t-40 86t-23.5 93t-7 90zM532 1081q0 23 17.5 40.5 t40.5 17.5t40 -17.5t17 -40.5t-17.5 -40t-39.5 -17q-23 0 -40.5 17t-17.5 40z", 
                        [["advance", 1000], ["em", 700], 
                         // ["defaultOffset", {x:-24, y:1200}], ["leftmost", 141]]),
                         ["defaultOffset", {x:-24, y:1100}], ["leftmost", 141]]),
  sigCongUp: glyphFromD("M61 137q0 27 8.5 51.5t20.5 47.5q29 53 59.5 98t77.5 80q-16 -23 -28.5 -42.5t-22.5 -35.5q-10 -18 -18 -33q-2 -4 -4 -21.5t-2 -21.5q0 -31 6 -49t28 -39l11 -10v-2q25 -6 51 -12.5t67 -2.5q29 2 60 12.5t53 28.5q12 55 12 113q0 39 -6 84t-20.5 88t-37 82t-52.5 65 l75 134q33 -29 57.5 -69t41 -86t23.5 -93t7 -90q0 -53 -7 -93t-22.5 -75t-37 -68t-51.5 -69q-37 -47 -84 -76t-107 -29q-63 0 -110.5 31.5t-47.5 101.5zM123 868q0 23 17.5 40.5t39.5 17.5q23 0 40.5 -17.5t17.5 -40.5t-17.5 -40t-40.5 -17t-40 17t-17 40zM532 868 q0 23 17.5 40.5t40.5 17.5t40 -17.5t17 -40.5t-17.5 -40t-39.5 -17q-23 0 -40.5 17t-17.5 40z", 
                        [["advance", 1000], ["em", 700], 
                         ["defaultOffset", {x:-24, y:1300}], ["leftmost", 141]])
                         // ["defaultOffset", {x:-24, y:1200}], ["leftmost", 141]])
};

var voidGlyphMap = {
  M: {
    normal: {
      base: arsNovaVoid.maxima,
      voided: arsNovaVoid.maxima,
      lhalf: arsNovaVoid.leftMaxima,
      rhalf: arsNovaVoid.rightMaxima,
      filled: arsNovaVoid.fullMaxima
    },
    flipped: {
      base: arsNovaVoid.upMaxima,
      voided: arsNovaVoid.upMaxima,
      lhalf: arsNovaVoid.upLeftMaxima,
      rhalf: arsNovaVoid.upRightMaxima,
      filled: arsNovaVoid.upFullMaxima
    }
  },
  L: {
    normal: {
      base: arsNovaVoid.longa,
      voided: arsNovaVoid.longa,
      lhalf: arsNovaVoid.leftLonga,
      rhalf: arsNovaVoid.rightLonga,
      filled: arsNovaVoid.fullLonga
    },
    flipped: {
      base: arsNovaVoid.upLonga,
      voided: arsNovaVoid.upLonga,
      lhalf: arsNovaVoid.upLeftLonga,
      rhalf: arsNovaVoid.upRightLonga,
      filled: arsNovaVoid.upFullLonga
    }
  },
  B: {
    rest: arsNovaVoid.breveRest,
    normal: {
      base: arsNovaVoid.breve,
      voided: arsNovaVoid.breve,
      lhalf: arsNovaVoid.leftBreve,
      rhalf: arsNovaVoid.rightBreve,
      filled: arsNovaVoid.fullBreve
    },                  
    flipped: {          
      base: arsNovaVoid.breve,
      voided: arsNovaVoid.breve,
      lhalf: arsNovaVoid.leftBreve,
      rhalf: arsNovaVoid.rightBreve,
      filled: arsNovaVoid.fullBreve
    }
  },
  S: {
    rest: arsNovaVoid.semibreveRest,
    normal: {           
      base: arsNovaVoid.semibreve,
      voided: arsNovaVoid.semibreve,
      lhalf: arsNovaVoid.semibreve,
      rhalf: arsNovaVoid.semibreve,
      filled: arsNovaVoid.fullSemibreve
    },
    flipped: {           
      base: arsNovaVoid.semibreve,
      voided: arsNovaVoid.semibreve,
      lhalf: arsNovaVoid.semibreve,
      rhalf: arsNovaVoid.semibreve,
      filled: arsNovaVoid.fullSemibreve
    }
  },
  m: {
    rest: arsNovaVoid.minimRest,
    normal: {           
      base: arsNovaVoid.minim,
      voided: arsNovaVoid.minim,
      lhalf: arsNovaVoid.minim,
      rhalf: arsNovaVoid.minim,
      filled: arsNovaVoid.semiminim
    },
    flipped: {
      base: arsNovaVoid.upMinim,
      voided: arsNovaVoid.upMinim,
      lhalf: arsNovaVoid.upMinim,
      rhalf: arsNovaVoid.upMinim,
      filled: arsNovaVoid.upSemiminim
    }
  },   
  s:{
    rest: arsNovaVoid.semiminimRest,
    normal: {           
      base: arsNovaVoid.semiminim,
      voided: arsNovaVoid.voidFusa,
      lhalf: arsNovaVoid.semiminim,
      rhalf: arsNovaVoid.semiminim,
			filled: arsNovaVoid.fusa
    },
    flipped: {           
      base: arsNovaVoid.upSemiminim,
      voided: arsNovaVoid.upVoidFusa,
      lhalf: arsNovaVoid.upSemiminim,
      rhalf: arsNovaVoid.upSemiminim,
			filled: arsNovaVoid.upFusa
    }
  },
  f:{
    normal:{
      base: arsNovaVoid.fusa,
      voided: arsNovaVoid.voidFusa,
			filled: arsNovaVoid.semifusa
    },
    flipped:{
      base: arsNovaVoid.upFusa,
      voided: arsNovaVoid.upVoidFusa,
			filled: arsNovaVoid.upSemifusa
    },
    rest: arsNovaVoid.fusaRest
  }
};

// FIXME: check this
var fullGlyphMap = {
  M: {
    normal: {
      base: arsNovaVoid.fullMaxima,
      voided: arsNovaVoid.maxima,
      lhalf: arsNovaVoid.leftMaxima,
      rhalf: arsNovaVoid.rightMaxima,
      filled: arsNovaVoid.maxima
    },
    flipped: {
      base: arsNovaVoid.upFullMaxima,
      voided: arsNovaVoid.upMaxima,
      lhalf: arsNovaVoid.upLeftMaxima,
      rhalf: arsNovaVoid.upRightMaxima,
      filled: arsNovaVoid.upFullMaxima
    }
  },
  L: {
    normal: {
      base: arsNovaVoid.fullLonga,
      voided: arsNovaVoid.longa,
      lhalf: arsNovaVoid.leftLonga,
      rhalf: arsNovaVoid.rightLonga,
      filled: arsNovaVoid.fullLonga
    },
    flipped: {
      base: arsNovaVoid.upFullLonga,
      voided: arsNovaVoid.upLonga,
      lhalf: arsNovaVoid.upLeftLonga,
      rhalf: arsNovaVoid.upRightLonga,
      filled: arsNovaVoid.upFullLonga
    }
  },
  B: {
    rest: arsNovaVoid.breveRest,
    normal: {
      base: arsNovaVoid.fullBreve,
      voided: arsNovaVoid.breve,
      lhalf: arsNovaVoid.leftBreve,
      rhalf: arsNovaVoid.rightBreve,
      filled: arsNovaVoid.fullBreve
    },                  
    flipped: {          
      base: arsNovaVoid.fullBreve,
      voided: arsNovaVoid.breve,
      lhalf: arsNovaVoid.leftBreve,
      rhalf: arsNovaVoid.rightBreve,
      filled: arsNovaVoid.fullBreve
    }
  },
  S: {
    rest: arsNovaVoid.semibreveRest,
    normal: {           
      base: arsNovaVoid.fullSemibreve,
      voided: arsNovaVoid.semibreve,
      lhalf: arsNovaVoid.semibreve,
      rhalf: arsNovaVoid.semibreve,
      filled: arsNovaVoid.fullSemibreve
    },
    flipped: {           
      base: arsNovaVoid.fullSemibreve,
      voided: arsNovaVoid.semibreve,
      lhalf: arsNovaVoid.semibreve,
      rhalf: arsNovaVoid.semibreve,
      filled: arsNovaVoid.fullSemibreve
    }
  },
  m: {
    rest: arsNovaVoid.minimRest,
    normal: {
      base: arsNovaVoid.semiminim,
      voided: arsNovaVoid.minim,
      lhalf: arsNovaVoid.minim,
      rhalf: arsNovaVoid.minim,
      filled: arsNovaVoid.semiminim
    },
    flipped: {
      base: arsNovaVoid.upSemiinim,
      voided: arsNovaVoid.upMinim,
      lhalf: arsNovaVoid.upMinim,
      rhalf: arsNovaVoid.upMinim,
      filled: arsNovaVoid.upSemiminim
    }
  },   
  s:{
    rest: arsNovaVoid.semiminimRest,
    normal: {           
      base: arsNovaVoid.voidSemi,
      voided: arsNovaVoid.voidSemi,
      lhalf: arsNovaVoid.semiminim,
      rhalf: arsNovaVoid.semiminim,
      filled: arsNovaVoid.semiminim
    },
    flipped: {           
      base: arsNovaVoid.upSemiminim,
      voided: arsNovaVoid.upFusa,
      lhalf: arsNovaVoid.upSemiminim,
      rhalf: arsNovaVoid.upSemiminim,
      filled: arsNovaVoid.semiminim
    }
  },
  f:{
    normal:{
      base: arsNovaVoid.voidFusa,
      voided: arsNovaVoid.voidFusa,
      filled: arsNovaVoid.fusa
    },
    flipped:{
      base: arsNovaVoid.upVoidFusa,
      voided: arsNovaVoid.upVoidFusa,
      filled: arsNovaVoid.upFusa
    },
    rest: arsNovaVoid.fusaRest
  }
};

var dothisagain = true;
function getVoidState(v1, v2, v3){
  if(v1=="void"){
    return v2 ? "voided" : (v3 ? "filled" : "base");
  } else if (!v1){
    return "base";
  } else {
    return v1;
  }
}
function getFullState(v1, v2, v3){
  if(v1=="full"){
    return v2 ? "voided" : (v3 ? "filled" : "base");
  } else if (!v1){
    return "base";
  } else {
    return v1;
  }
}
function getNoteGlyph(subtype, shape, flipped, voidness, extraVoidness, filledness){
  var glyphMap = (subtype==="void" ? voidGlyphMap : fullGlyphMap);
  var state = (subtype==="void" ?
               getVoidState(voidness, extraVoidness, filledness) :
               getFullState(voidness, extraVoidness, filledness));
  flipped = flipped ? "flipped" : "normal";
//  var state = getVoidState(voidness, extraVoidness, filledness);
  if(glyphMap && glyphMap[shape] && glyphMap[shape][flipped]){
    return glyphMap[shape][flipped][state];
  } else {
    return false;
  }
}
/*
function getNoteGlyph(glyphMap, shape, flipped, voidness, extraVoidness, filledness){
  flipped = flipped ? "flipped" : "normal";
  var state = getVoidState(voidness, extraVoidness, filledness);
  if(glyphMap && glyphMap[shape] && glyphMap[shape][flipped]){
    return glyphMap[shape][flipped][state];
  } else {
    return false;
  }
}*/
function getRestGlyph(glyphMap, shape){
  if(glyphMap && glyphMap[shape] && glyphMap[shape].rest){
    return glyphMap[shape].rest;
  }
  return false;
}

