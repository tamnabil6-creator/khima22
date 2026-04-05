/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Target, Calendar, Clock, TrendingUp, Plus, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChallengeData } from '../types';
import { cn } from '../lib/utils';

interface HeartEffect {
  id: number;
  x: number;
  duration: number;
  size: number;
  delay: number;
}

interface LoveNote {
  id: number;
  text: string;
  x: number;
  y: number;
}

interface ChallengeProps {
  data: ChallengeData | null;
  onUpdate: (amount: number) => Promise<void>;
  onReset: () => Promise<void>;
  onToggleAppliance: (id: string) => Promise<void>;
}

const PRAYERS = [
  "أحبك يا شمس ❤️",
  "اللهم يسر لنا ولا تعسر",
  "اللهم بارك لنا في رزقنا",
  "يا رب اجمعنا على خير",
  "شمس هي نوري وسندي",
  "اللهم افتح لنا أبواب الخير",
  "ربي يتمم لنا بالخير",
  "أجمل مديرة أعمال في العالم",
  "معاً نحو حياة سعيدة",
  "اللهم ارزقنا البركة"
];

export default function Challenge({ data, onUpdate, onReset, onToggleAppliance }: ChallengeProps) {
  const [addAmount, setAddAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [today, setToday] = useState(new Date());
  const [hearts, setHearts] = useState<HeartEffect[]>([]);
  const [notes, setNotes] = useState<LoveNote[]>([]);

  // Background Music Source (Base64)
  const audioSrc = "data:audio/mpeg;base64,SUQzBAAAAAFjLlRTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMABXWFhYAAABIgAAAf7/AE0AMwBQAC0ATQBFAFQAQQAgAFIAZQBmAGUAcgByAGUAcgAgAFUAUgBMAABodHRwczovL3d3dy50aWt0b2suY29tL0BsdXh4X19kYl8xMC92aWRlby83MzUxMTk1MDQyMDUwMDUxMzMzP19yPTEmX3Q9WlMtOTVENUF1cU5PMGcmc3Bfc291cmNlPTc2MjQyMzY2OTU3MDEyMjcwMTYAVElUMgAAAkMAAAH+//7/AE4AMwBJAEgATwAgAEEATgBBACAAVwBZAEEASwAgACAALgAgACAALgAgACAALgAgACAALgAgACAALgAgACAALgAgACAAIwZGBjkGSgY0BkgAXwYnBkYGJwBfBkgGSgYnBkMAXwZGBkUGSAYqBkgAXwYnBkYGJwBfBkgGSgYnBkP+DwAgACMAZABpAGQAaQBuAGsAbABhAGMAaAAgACMGQQZEBicGRgAgACMAZgBsAGEAbgAgACMAZgB5AHAAIAAjAGYAZgBmAGYAZgBmAGYAZgBmAGYAZgB5AHkAeQB5AHkAeQB5AHkAeQB5AHkAcABwAHAAcABwAHAAcABwAHAAcABwAHAAIAAjAHQAaQBrAHQAbwBrACAAIwBpAHQAYQBsAHkAIAAjAGYAbwByAHkAbwB1ACAAIwDpAGMAcgAAVFBFMQAAAB0AAAH+//7/AGwAdQB4AHgAXwBfAGQAYgBfADEAMAAAVExFTgAAAAcAAAAxNDAwMABUQUxCAAAAHQAAAf7//v8AbAB1AHgAeABfAF8AZABiAF8AMQAwAABBUElDAAFZXgAAAWltYWdlL2pwZwAD/v8AYQB0AHQAYQBjAGgAZQBkACAAcABpAGMAdAB1AHIAZQAA/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDACAWGBwYFCAcGhwkIiAmMFA0MCwsMGJGSjpQdGZ6eHJmcG6AkLicgIiuim5woNqirr7EztDOfJri8uDI8LjKzsb/2wBDASIkJDAqMF40NF7GhHCExsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsb/wAARCALQAtADASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAECAwQFBv/EAD8QAAICAQMDAwIEBQEGBQQDAAABAhEDBCExEkFREyJhBXEUMoGRIzNCUqFyJDRTYpKxBhVDROGCwdHwJTVU/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOLqssosrGPUaPiuAJWPrddSVFZYnFJ2q8i2t09y0VcUnLgCuPHc0nKk/wDJrCUuqqca2tdyJdMfdHlb7lVkTk3JvfsBeN43GUZ7xvnuXWaUpyeTpo5nLlXSZ04MSWSs6XS1swGXKsqdTTUFe5hFXw7b5N44kp5E8fHNmuj0Ft5Ju4vakBGlUc2WMJxdLwi89D0+q3wt4npYscccemKSIyq8c0uaA5dLJrSLvaZvp59WnVdtjD6fGXpLq7bUdOGKjCkBZWlsOtJ06T8E9ilRk7aAs2ulqgkmuAluWA588Y+1or/7d3yma6jfH432KaeHqY5KbfIFMkF+Sk09zOcfUxyS2dHa8UE7d7GLhjTai935A58OJdau3ce5fJbX3Rpig6bqtmjJprHHq5oCuZSeOFLlbmCUnTljkvD8HfGN4vlDHjbik00gObAprJB73fc7ZNt/BnFe+MV4Zaftkt6sCsssYW90YalJRlOLjUlun3Ol445U1Lkzy4oel1VaA4lBSTUI9Lrl8G0MUIw5TvfY1zpwxe1XW6RxxydKm57S7UBTLjlKfSqXUZRqLaez4NskZrH1SVR7eTHbmMdwNFK2vCOrUxuEXSUNqo4IS9zv+09LKv8AY4eelAckZuDae68o3xSUM0ckal2ZxxXSm3Lk3x+2NtrfsB7cZSkk41TLW74OLQarG8UYSkuu6o7k0+GgMcz68c4U90eElSrw6PomrTR4GSChkyR8SYGUuSsn7H9i0nvsQt015A9STf4aFK7hujhjgzRWSUdpVskzpwZ+uKgpq1Gq8HNiko5JW2pN1YGqxZMmijGDp7UzWeOTgk5p0r+7JxtyTVOkt/g58sVhw9MeuUpO/sBngc1qMbcen3UmZ6hL1J/dm2mjN6jFBqo3dlNVCKyy6uboDkk/BTqd8I0k4rhGTe/AG2JuT6XvZ0YYKWZJy/KuPJlpIrJnjF3VN7dzphKKyKTx+nNd34A2ydCqNfoW08oxS2u5UkuxMoKUbcopVzXJGHD6fEu/IF9QsbUuuLaPNzRuXti6R6WXC5O3KTOHLKcVeyXyBli22aS32O2GXoilL8vnuzgu6b8npKKjkdratmBk5R6ndtv/AAbaH3alNKqRnO7fC2/U0+nvpz5G+OkD0W3ewV+Qt9yQGNJNpcGlnLqMzwYpZFG6OZfUpy/LBIDpy7a3G/g6afVZ5qz5JxeSSXVHg6NFmyZZS63wB1gBgR1JbWiJTjFW2YOC9Wbf/ctslvVAX9aD4lZ4eqUv4lcPIex7b2o8fWJtUtk5MDGXVKVSkqIarZOyssclG3uV/fYDq0e+pivB6Mte0vZD9zzdDtqY/Y2xK8rtXuwOuOvyv/00Q9Xnu1Gv0LYfyS9pL2XH+QM/xGeblFOnHwVjLUzdOTovja9bNwntyWi3slKIGEsOR23L/J2SVaaH6HPOcU5XI36ZLDFuVrbYDytYnHUTkl92zhbk5W1avwdurlBamdNuXg55PI77XwAV9Eslpt7V4MsKk8u0equS+TJCPscdl3LwUMVRXUnLlsApQyY7nKv0M5ZoOovF7fgt6kVNw2aX+Tnyu5tpdPwgOrq2sjrcq7UVvbhhMC7kqtkxdyqt3wUUqjTVpslyj1LpVUBtGPVvJfuUgpPhpP5IxTfXzt4ZKnCLklG5vyBaGNZXVdNcs64TjPH6cmn0r2tnJGUluo232NMOKUve4tRj5A9B6d58cMl9LpCe6bH6WLpu2mTpbenSfbYvBbP7gWD3HckDn06/Mv8AmNo8NfJlhvrn9zVd/uAkrjSKLZIu3uUim/3A0AIbAia6k9jnyab1Fayzg67HR2YWwHA9DqWq/EN/qVhpNSpfxJdSXDs9IMDmxzcPY48EZJKcepKk/JtPH1Rfk5urqwX3it0B2JKrXdEqimF9WKD+DQDPpXqRfwXZEmlW5PIGcF75N90WlFdFdiFGpN+S/KoDDOqxSaVtRPLx5E002/crao9fNLoxSlXCPKlGOaMpSfTJr2gUWOeRdc51BriyIYfUjJrt+VXwa6fDKeNJyuEVumVjWPL04WqafVb4Apmw5MSaVNVzZ3N3oou/6Tz803OLqffajvwR6tAl8AeeopJxW8iccmk2473wRKXulS4IySmoquAN8Xtm8ij24R6umm5dEowfTLv4PM0c4vPGMvynvQSUUoqkBJ4mpXTqMn3PbR4us/3vIByyRC+C0nd/BWKtoDqwwhtO92t0yM0YxjaSNNJpHmhHJLJ0eEjolo4JLqzfuByaSc3Ok3S5Lz1DUZzmm1F0lHcjDj9HUv8AiKUHe6RnllKT6MUXu7bAjDlb1mKajtJ1T7GWva/E5Nu506SL/Fw9ZK+1HLrZqOsy2r3A5mm+VRRxLzm5PZFH1XumBtgbjJNT6HXKLqFyc3KUmu77mOO+xspPa72A7MC69HCU6q26ZbTZHKqbbbrZcEQuWigtrbfTaNdMlHrUGupOmBTLCfW08kmn8HDllNOUUqj8no6jL05HF0tvJxTTcd1ewHNDs5Lv3PWk4pe50eUk1JWu56k1F9KdcXuBjknju1K3R0aC3mdbWjmcoy2g49S7UbaSUlnqLXV0gei4TT2mVcMn/E/wwXgpNXJpslp+QOPVJ/hsnU+o82LXhL5PS1ak9NNRTk2+EcMNLmlH+VJAbqX8CbvZI00dZcjjbScezKLDOGD05xpy2SNNHgyYs7k0uKoDpWkit/Un/ANRvGCiuW/uyLlXCJXVvsBnKCc3sivQmqNHBt3wQ8Tr8zQFFBLZI8nWQlLKo2qvg9n02u9nkfUZdOqUY9gMs0VCPTHg5ZO5G+drp2e7fBzvkDp0VfiYt8JM1h6kskuiEnT7GWlVZH/pPfxxSgqrgDzcbnGDj0Tt/Bp6GXptRb/U9D3XtwN+4HnLS5XmnJwpNKjWOlnF2uk7Gm+9BX3YHF+Dk0+qaMdVqunpwxbpKnI9GUaTZ4+pwZJ5JtOwM8GGWXDPPOTZypOTpSpJ3vyenp4/7O8UXUktjjhopZ81erWStwOXIoQkpQXXTuTHqPLKUszXhLwaSxTw4ZucaSdJonFGE8cpTSu9gMY4ZScZRg2r3+xtLTyzezBD8u+/c9L6dpElDL13Gvy9jujgxwn1RjT4A+aWRuPS+3FizRwi1T2MpVSq0wBeOKcl1VS+RGHVLmq7muZTUlFTu1YGNuDqSrwQlJzUmtvJsoR64QyXXOx0TwdV+i0vgDllHJJqcVaTStHrQjKekpu2qOLRZHic1JexdnydcNZgnFxtxbA6dMpRw1Jb2bRMsDvCvddGn9afZoCWSQ0AMMTbzZV4ZsYwVanIq53NlwAfKYjs2SxyAfBBJAAeAGBLIYZIEdjkzQ6Ouv6lZ2eTm1Kv/AKQNNP8AyMf2NWZaf+RD4Ro9kBCjct6dE87kLd2SgIf5gkGFtQFMqvHJPhnj5YSxZNuO3we1l/K/seVq6Tip7Jq7Azhqn6bxy272+5nLIpO0/wAyrYzmm9oxvw6LLH0XGVKXIELFJwfQuHb+Dv0kpPSKPeOxhgu5RjNVOJvo1UGm97A8/MnHNNLyQm7pM3zR/jt2vcXWJTwRyVv1NbAZ4YNvqT3XJ7OnzzlKMUm40jkx44NYnxapno6ZKKaS4A2PF1TT1OR13o9qzxdV/PyXtuBzS27FYvfwTJ7FVyBvDqk4RWNyje7XY2no4PFv1dXhsaSUnFQVnS4yjD3cgc2j08Pw8pKXTUuSZzx4IdDlfV35o30UFLR5Iy7swy4IuLfLQEYMM/UjNQjs9pWcmqh/tGSUt9zu+n9SWRL+nszl+qS/2j2qrjYHNOkuxk5K+SGm9+fkhxYGmNpK7NE03zuymCFyd+DbDivLC6q7A7Fpc3rY253CK48FsHV6k4twabvZnRKSUG01TRyKEfUTi0m0BrnVTvizkypuTp2deWKbvrW3Y5skJ3LpVgcNNN78HrRfqY8c5b+26PKafU+rauT1MSyQ02F0mmgKZHGqUOn7FtFB5NRz0tLeiuSoySp2dH0xN5Mk624A70umld0HwVyqfMWkjL18SVSm2/gCY31Xfc6I8HHiz48mZxjJvvui+Rzbajs18gTqVeXF8M1teDnbn/C9TmzaMblPd7gX6lVtpEuceepGPSlP3bxLtQhVxqwD1GNcv/A9eDVq3+hZRi1wiVGPZAZ+um/ys8nWw6te6+7Pb6V4PIzv/wDkMm2yA486jGdLvyZPbgvqJKU20ZJ2B3fT4OWdr4PagmoJM8j6XKtSl5R7VAQCe5AAAAQ+Dh1em6oNRfuk1dncZ5YKa43XAHmrTTx4HUpdXDpk/TXjjqJUnGkt+zN9Tm6MU1FfEr7Hm+vB4urr935aS2oDrypY5zj7Wua8nL1RnNpQjC+THI8nV6tNp972KZvdOMYTVPnYD0cWZSfTibTiq+C2LWrC8nW5SbfJ5Xp5sWKWSL9vciU4qNuTba4+QLTXVTSt32NMUVU5zx/lXJLmsEopRvsTnlHp6Umm3vuBnHFJ4FKqv5Em66pu72OuDjOKh09tkzKWPFjg5TTcW+3YCunm05p10xRnbpNNq3dos8TjGbhbr/sZ5MrlTikkuUgLqbfLba4L47tNU7ZGOMeW7dbEKXpZE8e7f+APoIRSgklWxY8+H1BrHG4pyXJbT6t5M0uqSjDx3A7gLT4fKskDmcpLUSilbrY3lfRtyK3vuSBCdpBoskGBUFqFAVIZatw0BHdAbE0BHYw1Hb7HRRz6rboX3AnSu8CNjDRr/Z/1Z0LgDOUlF0+C0SZRT5QUUuAITTTrsO6Kdajm6a5L0Bnn/lt/B5LyxnGMckepI9nJHqg18Hzc21KSumm0B0ybyKThsl2YxOGOp5F1L7HPDLNro2o7o3HEuhRap7PkCIvB0PJGoyvjwa6bJFxavfq2MMTxZIdElUm99iuKKxycY3SntYF5Ylkbk3Vcovp+laeUYviXBWVObi73NMGHowyk7bkwLQdxxO/6j0sE1ckceiVaeNwTabOlNp7UgN7Vt2eRrZf7TPxt+p39UvKo4tfSyx/0gcbKXXYu9m0VqwPT+nY4ywW3W5pmrqkk+Dm+nvqjOO/tZ05aS2QFdA16eSDeyZWdqDryRpKbybGmVbbIDL6e4rJk6u5zfUa/EOW3FG2k/nT24RzfUvdnSX9oHLKcVsZ9SJcGlfBVxA307i59Pc6McU8kU+LOXTxayJ2dPVe/FAdmbokmrfT4TMozxxnGGONJLlmmTE/SjNLqbgtjilHJBpy2a7Aei4rpcnJ7rwcma31KMt1ydnVllGLUIuFJo580nFSco7vmgPOcpyvq5rk9fSuObQQi7223PMl0ybUNvuejpHL8NDZe1MCmXC8dbbct2dv07F6eDqu3Pc5czuCt1aOrS54+jGCTbSA63wZZFCP9K3+CZTnX5P8AJjllKSqqYEKSWySbfwRbu1wZt9KdP3IK2277AXapxl4d8l4Zvf0+WZKV42+65OdTlGW6pvuB6OPpkm+aJl0ylymccJ1Gk2hDJ0ra+QO1SSfSyYtLucbfW1be5m24y2dAei8kVzJHlahr1s8+3Yu5y/qkjPNKsE9r2A85K1fkp3NcicYK2lZk9gO/6bJRzpu9keqtVF/0yPE0brKm9qizt60ny+OQO56j/l/yHqPhHB6kXzaEcnVk6Um41yB1y1MvMQ9S2vzJHMKA29ed/wAz/Aepdcv9jGiGgKZ8lxr3O3ucOZQbklbUn4O7Pibxe3luydHjTxPrjbutwPPxyyY4tShfT+xm8bzZkoraSvbsezkwxeKSjG7VbHlem4zlFJxb2YEpTw6dyyRak9qZy5nUt4+5o9n0ckcCxyanPyzCekllcuqCjJx2YGE5tY1JtSlZnGLyTpvdleKXNF1Td7oDeWJylHoXGztlcininLoyJpdmRBybcurZLkRhLJJy6la/yBaOfLGMXJxfyjJ5HHImsScmaZVim11JprsispJ0knS4YFJz/iNbJUE03G+xba6klXZmcY3s5U+wHTkm0oqDarn5KdTvqjzRWa90ZRnaapxZ3aP6d6kY5M0m41slsB0fT5ZMmNSyLtSO0pixRwxcY3RoBHcAAASQAFAkCB2JIAh8okhrdBJp8gSc2q93p/dnSc+pX5PuBbSqsNLybHNo3cJLxI6AJIJFAVcE6fdcE0SiOADPmc0X6uS9k5P/ALn0z4Pm8lerPvUmBlFdM4trjk1WXoknBtvsZN29+4i36sa7SQHbo1epcp7Sq0ban+Ypvu0vuc/4uUXahFSXDJlny54/xGva7VICZvpyKSR2qXVpot90ck11M3wT68MoN7R2QGujdwlb2T2Oi1ZhoYxl1xaumd3RjXgDnlkguZJHFrZKUoOLT2PSl6DXu6Tg1/prp9NKq7AcTexVMm/giwO36a2llaV/Y6sjuLtP7HJ9MyenlmqtNHbl9z60mrQHPo1N5MiS3rubZG1drcroVWpn8onK7yT77gc2mWSeeSjJJ13Ka6Ho5IyySTbXY10f++Pak0V+qx6s0U+KA82WS0+5m5q+C04VdGbi7+AN8M08kV5OhLmjn00f9ohvZ0tNTfG4How30+Pe9jj1SV/J1aXfTK3e5nqYbXQGkFB4ManNqoruYZscKbjPqpd2b4cSy44v4opqMUYwaQHlypyfXVnp/TnWnq01vR5sYxbqR26KajCMI+5+ANc++KkjTRQk4rIntZjmyb1+U6fp8m8DSWyYHbyjl1G0rui887WyiYZcvq/KXcCr2l23REcvN9iIKLcup3RnjjeotZHSXFAaYpOWPI1zexm79sZNW+3c2j/JyOHNnNghXvyNuaAzlkccrTVJbcl8WTZpPjkjLi6pOey2Of1ejaVb90B2wyd1yy3Sm074MoKLjvLktjU2n0q1fICS3Wz/AGZORqWCSuk13O9RSgr8HHqF1L29gPP1GNKOJ7Wjnnydep/NFeEcmXZgdGht6ikrfS9jtnjyqLlKGy5fUcn0vfWx/wBLPS1eRPG4U7kgOTqXdpfqXjPH/wAaKMljfn/Bbo33j/gCzzQTV5NviJb1cdX1y/Yp0b/kZMYt3s0BLm6uKbREJNyUZwcep1dj3/0xT+7I/i8uMVXyBvnxPGouMv3ZrCPsi6q12JUIaiCU3ckt9zRQ6YpJUkBzZ5+nv11XKrk5FJx1FuLik7VnfKm3aW5x6tNyS4Vgdj/MA2r5KynGKbe/2A8ecN7f6oVjkvZt9zJKaXVK9zbGuqDioNu+QITUVVLcnFkjCLWzb8k9Pv5rtwUm0o9Mkupd0Bbp/qbKW4yZEZOO77kOSV3vuBdNNbtq/wDI6f4XVB3JPdfBWUnJLbZdhN9Hak1ygNIOLXS1s+fg9T6U5enK3Jpvv2PLTxZVBK6S3Pd0nR+Gh0KlQGxIAEAkAAUyZI4oOc3SRlHW4JK+uvuB0Ax/FYP+Ih+Jw1/MQGwMXqsKi313RXDrMWZbSp+GBuASBBjqV7U/k3MNV/KX3Aro1UJ/6joOTBmjjc4zdd0ay1eGK3mv0A3IOZfUNP8A3k/jtO3+cDoIfJni1OLNKUccra5NAIbPmsycc+RN7uTPpE/dujwvqVfippRrcDlj3TKvaSvZlobyD3drdgaQlJJxkk/kvjqMkk7Mq3Xlo0xKpvZccgdEuWbaRrpnGt0zLlW0a6VfzKA30H87L/g3jgyvIpN7J2jhwzlDVSrf2npqWak6VUBD06lykefr8fpKPVVO6omX1PM5SjHGtnyY5c2XUfzen2+AMCr+5banRX7gdv02CnqXf9p3aiPQ+lPlHlYZ9LbUnHblHZppOWPqc3K+7Aaabhmm3u1HY2k95Sa55MNJvrafg6c698ox22A5dPOMdZu+lVvZX6rkj6uNp2q7GOp9vXJ70jHK/Vw4nVbNAYSyc7GUsj5pF5watGTugN9NkvPHqpLydP8AW6baOHGv4sPud+6ybqqA7dF/Ka8Nmep6pbUuny2X0SqE74srqLa+ANdPGcdPDpdKjnzYprrcnd+DfDlePSx6le+xnnyynjuMaYHmzhc99qO36fhSjCTdNvt3OTIp+ra7noaH3Y4prdMCdTp/e8ie/gnR5JQi433NdRJRg+qXSvLPO/8AMMWGE4Qi5t92B6Esry9UUlJd2mRGo46bVfJ4612dJqHTBPwjKeSeTeU2/wBQPYw5sS6+qaTb4sh5sKbfqRTZ4vHchvy78Ae9DLijhnWWLk9+TnWpksStOUnyeS57bloyaS6ZP9wPS9SOSoSUrf8AgpXpypKMlLlvsccdRmhxJP7o1xaqN1kVLsB1PplFRhs13fc6tJfrJzdd1XDOFZVNPpqR3aNRcE+ZVt8Adk8ieyao55UlKy9e1WZZIJ79wOXM4uPN/Y4MnJ6M8aSaqjzs0ae4HT9M21id/wBLO/UZemUdm9jh+lr/AGpf6Wdmqi3khSvYDN5mv6B68lu4UR0T7RKzUltJMDoTtWCI7Y19iryRXLoCydvatiy3MfVxxt7K+TTHJySfYC0W4ZIuLq3TOjLbb3dGD/PD7nRnb667UBmlvucuobclvtZ2cO+DDLFNX38gI5ISbSldHLn1EG7UpJLbbuY6bM4vK57pKiNTKM9P1QjVLYC+GMZQXUrrszSEEpySVFMc+rdtX4Iy8OUZVOwGRNKXSnucrXS3fL5OiepWKFS90+3g5ZOUpNyXIByWzu77E9UOiVJX8mbi7Lxg07dAdul0ccmGM5ZN32OrFpunTuElHI72sw0UZyxxg/ypOmMWSWTLPH1viogd2HR4WoznhjFral3OyEVCKilSXY8vBPLFKGSTcXfBstb0YbcXXCbA7wcmi1UtQ5RlF7dzrAAADm1yTwNPuzkjijVUv2O7UxTxM5lflgZejHsl+w9JeF+xrv8AJNO+4GXppdl+xOn06lqPU29qrg0p/Jmszw51H+5AehH8qLER4TJAGOpV4/1NjLUbYWwOKcFN+5XRVYYeEWg7nLc0VgZLBCuEWWOKa9q2NE30tOxuu4EaLBCGWeVcy2O1rcxwVdfqbAKPA1++ryfc98+e+oJx1+S++6A5pJXsikdn8o0b7vgil1fdAavG5yg4teDWOLonTadeGRliscMUocSW7LYY9cXJNLpA1SuNI00zXTKPcxXfzRtpd5zvtECMCvVS+YnsRT9KN80eLkVZU4vc9nH/ACofZAeXPTxU5J6iEbfBlkxLFG45ozvajTPfrya8+Bmivw6lJU78AciWxEi1OtysgL6eKlmjGTai12O/H0wxqMb/ADVuedik1mx1a3O+EZbdSlbnbsC2mVa79DozNPJd9jmwqvqEXvW5tkilNpbgcUoqWphCS9snuTr5QjGCjBRUJNbL7EyVaqE3tUjP6hBvHGfMXNv/ALAcM5qSbqjJtF5bJoyYGunaWaHVxZ2P873vc4cS/iQ/1HoT2k20B2aOljlfmxqHHdtFdI9narbYan8jbXAE6Verg37NpF87UcHVJ9MY87FdHtp4Sqoy3otrl/sGRWqYHm5OiU7hKlV/cnFRWLHLfE03KLuPygMM8bxXfByM6szvE6o5AJ7CyAAJIAFlJp7M1jlpbbPyY14AHR68mvzGeSfV3szRbatgIQsEWBaLp8nZiyRyw6MlWcRKf7gXz4Xil8dmZL5O3FmjkShkS+5jqNO8btbxAwaog0tShXdGYEx5RpF1k3exkjWK9y+wF5UpJ9mV4k0Wn7obdijdpMC6+TbHJeTnbLqS2YHoYJPJjeF8r3Qfyd2HKs2NT78SXhnkwk1KMovdbnfgyRWW1+XL/hgdsHUr7HRRyfB04ZdUK7oCekUXfBAFSOC9ENAVsAACKJAFaBOxDAq0R3TLvgpOSxxlJ8JXuB4GvSjrci4Rx9Hlovnm8mSU2+WYgX9i4Vkp1wqKCwNOqlTk39hs96/czF7AWbrZEc9yABKJTXgrbItgXbVcFaICANAloLkCY7MlE5H8CO6vwBR8iO73JdEcMC6dJ7WQ9vcuCYvcV27AVb3sLgcNEx2kBDrsRW+xL2uiL8AWVNBxqyI8E8sCHsqIvcl7tlQJbHJBKAnsE1QryNrAmLdk9yqZL3YEhbMhbPyh3A1jC4tLi9yXjcbft22N9Bjjl64Sb3R2x0uKqcW/uwOJKUXFqSVrZpGsZ6yW0Zv9jvjjikkoRSXGxZJ0Bx+hrZNOWWKLrRzbvJqJN+EdiiWUQOdaPE/zdU/uzeGHHFLpxxVd6LqJjrVNaduDezt0Bj9Sk8aj7pJXu0U02vl+R7ryRhz+rH08tSx/Jnm0sXJPTz6W+zYHoLVx8Xucf1GWSeSNr+H22MMWR4cnRkVSTPSxZVONbP4YHPHSy1EIdK9NR5bN28WG5RqU6pyfJvKXVG48+DzdQ1kfVxOOzQHky/KzE3spjxzyTUYq2wKUXhhnk/LFv5PSw/T4wX8T3z8LhHR6XSq4+3AHlx0cquTon0IJ1vI9J4U/wAzJWOC7WB5foJt+1orLT/22ev0xXCK9MfCA8aWKcez/Qq2e08ca2ObNpIT34YHmg0y4Z4m01t5M+AJQ7hDuBPijrwZ4zXpzRxk2Btn07xvqjvEwa32OrBnv2TZdYcccjk1a8AY4dNcevJsuy8lYr+M18GuXN1Nwi6RlhTWXfmgLLlKtmZv+pGkl0v5sxnL+I2BaLuJMX7qKY37q8lns/sB0QdbUdOBqUXBum94/c4YS4d7m8JU01zYHtYsiyYozX2f3NcclGd3ycOmyx9VUqjlV/ZnXToDsoFMMuqG/JoBBCJdACGiKLEUBVkFmhQFGRdlqFUBR8cHB9YzLHpeh7Sn2+D0mfP/AFzI5avp7RVAec3uVAAlfIogATTFCwADYbIAAAASiCyS8gFuy0E+r7EVQtqwGR3NiD5RUm1e2wDjuQy3S27KvwBKui6+e5SG8q8l+jxJbAVq1fdEX7ky9fO5Xo+ePIB3dNENb77F2rfNESiq5ArEXvsTHZ7l0lTYGXcMBgQSmGQBa7IslIhgESk0yC0H2YDe/A37lq8bkNeAN9DPo1MHdW6Z7qhvZ85il0tPwz6GOrw+lCUsi3QGnQiyRnDU4J8ZYm3KtbryARJUlMCTPU5ZYsTcVbe25o9lbdV5MM2fTuLx5MkallyBnPDj1OJVFY8i7oyw3pp9GWKTfElwzjeeeKTWObljTpSOuM45sLhN88N9gN8+HDqo1LafaSOBrLo5qM912kTHUSwT9Ofbv5NJapTj0OKlF+QIWtTarsMuX8VFtKpx/wAo4JKpuPg6MMvTmp8gciVtJc9j08OCGGKxwknknvKXhHmwl0y6vBeGZqbd8ge1BRhCocGcnTOTDqX5uzX1VICXMo5kNlHwBb1K7kPI33M2QBqslluq1yYpslMC80ppqW6OHPp3DeG6O1MrL7AeYgb5sXMorYwALklkACTpwZ1+Se/g5rHawOyM9OpKTtNdqMVK8spLwYt9y0XvfwBrF9Ud+xzyVNo2xSqW/HDKZY1ICkXTs1l9zE0hugJi6ZtjfZGL5LY3/hgd2CTlcFy94vwz08GX1sSk9pPlfJ40XTTi6Z6Glyt5K/vV/qB6GGfRPfhnVKO1xdo4L33OjFlcF0zdL5A15JM8mowwVyyRRy5PqumxptSc2uyA7QePP6zOTaxYq8Wc89brcu99K8JAe85KNtyW3yZz1WDHXXlir+T56ssr9TLS72ys1hjGpZHN/AHsaj6vp8bqNzfwY/8AnEZJ9OJs8luLVwxys1itR0r08VX8Adr+q5ZQfTjSfk8jPkllyynN22dktLrHu1So4pRrlgZgAAAABKIJsAyAAAAAErgigBayLBAAAAWjJ8B7tkLkm7YFS9ey0Q0krslflYFU2WU6+SgAv12R1FQBaJZ3WzKIfqAYCVgCVwHHwQSrAhbMlk1vuR3YFSa+SCaAlNp7Fm2uUU47lt2gCdbEqVf/ACVfNkPkC9qzfFrs2FKOPI68WcqTk9jRYHW8kgPdj9Qw/hY5ZS93Dj3s45/V8spexKKPM4VchypcAa59VlyyuU27Mk7e5Q9D6Xo1qctz2jEDthpl+AWJR9z3v5OGDak4T2a2/U99QpJRey4PK+rYPSyxyxW0ufuBGeMM2nVUpwRy4X2b2GFvqV8DJFwyteeAL58baWVcrn7GfU+jYnHkl6nTN+2WxXp6ZOL7AYN0iOorLkiwN4TrubwyPzsccWaJqgO1TLXbOWMvJspcAafBFBOyeQIoV8FkqAFaIot9iGBlJbUcubHTtHXJmGRIDmJNoLHVSi7+5olh/sb/AFA5AmdcsWKa9ntl8nNkg4SpoCKJ/tKlk90AT3NMj6salXwZf1GuN9ScX3Axp+CY7MuskoNqk/uh6kGvdDfymA3ITadF0sUpbSaRaOnWSVY8ib+QLwdJHRhcrag6fMfucsceaEqcbRquqLT4oD1ZZm9M8kXUq5fk83IsmSvX1SS5W50Y031RlJdGRbfDMI/TodXuzJr4Axi8X9eRyrhVyWU4y/kaeUvNno49JpscfbFSfls3jJR/LFL7AebDBq5/lxxxr9jVfTs2RfxtRXweh7v7WOl+GBxR+naeNN9UmaQ0uCLtYl+pu4y7qiHCSAolGCqMUv0Icr5ZZwl5KtAZ58ijhyNu9qPBbbPZ1zUNLXeT4PIca3YFASlZPAEOqIJDQCwQSBAAAEoglAFwyCeGQBLZBJAAAAC0lRUm7QEF4btr4K0TDn9AKksgAAABK3DJDQCJdwj6bl1VJdvJnwyW7AhVYsBgSm38kpbr7lUW2a+QN9XixY1Hobtq2c6dCU5S5ZUCzIIJrYCexMU5P/7lCyk0q7MDRNQW3JHqtcFZvfYoBLdkAAD29Bnhp9MnSbPENceSSVXsB73/AJi326Tk+pap5YQjtzdnD6r8kSn1x35QFlJtUXk5Sx9X9pjF0zWE1uuwFopOmTlVq+5TqS78msceXKlGMG77gec3bAfJAFk9iUyhYDWMq5NoyOZcmkJbAdSf6l1IwTNEBpZDZCLdIFbIZp0hx2+QMmtjOcbs2dFJ1QHNKO/2LYpW+l9+C0osylS77+AJls2nymT1qcemavwyuaabi63a3MepgTJdMqsl9mVbt7iwD3ZeD2My0HTAvnS9sl3RkdH58TjW63RzgSi8JOE1JPgzJsDpyye2RN0+TO21fYnDLqi8T4fBRXCTjIC/VJLl/uW6q3d13KXsSn2YGkZVtbNYSdcsw348GkZcAe9oNSs+Lpf548m8ou7o8PTZnizQyRfD3+x9BalFNcNWBg15KujVozkgM5FGtti7KvhgeX9VmozhFcpHmNts9D6yv48XfY84ALAAEt2QAAAAAAAAAAAAkgmwgIBMiABJBKAgtDncqwAAAAAASvJZcFa2LRdWAn2K8E7tjjkCGCdqCVgQmFQaphV3AEEurHYCAAAAAEsgAAAAAAA0U13DmjMAXU6J9TxsZgDbDNyzQT8o+l4SSVKux85ocTy6qCXZ2fQ3vyB8u3ZAAAkgAWstB0zMlMDqhK1RtF7HHHKo9rNI6pRW0EB2IvG64OFa2a4iiHrs3ZpAejTrx9zOcormcf3PNnnyTdykyjbYHdPPij3v7GL1TX5Y/uc1gC8sk5cyZWO7IJToBJ2yAAAAAAADbDKmimWPTkaXBEXRpl90FLvwBiAAJTp2uTfOlkgsi/U5zbBNbwlwwKwlezLmc4uE6ZKle3cC9uvsaQa78GVl4S7MDaLS+D3/AKfm9bTJPeUdmfO3unWx16XUy0+VZI7ruvIHuyW5SS24JwZoanH1wf6EtUBi0Ukvg3kvBnJUB4f1iL9eL7NHnHs/W4twxSrZWjxgAAAEpbEAAAAAAAAAAAABJAAMAAAAAAAAAAAAAJIJQE3sL2+CO5L8ARzwE6CohgWu0Q1QQ2YEAAAAAAAAAAAAAAAAAAAAduh0css1OaqC89wOv6Vh9PE8svzS2R3lE6SSVJE2B80AACAJsCATZAAAAAAAAAAAAAAAAAAvVY7rciCtln+T7AZgAAT1Oq7EAAAABKZAA6lWoxV/XH/JzcMnHNwkpI0yx616keHygIjLqVdydzJOnZonaAvGfng0TrdOzBMtGXSwOzT6meGanB15Xk9vS63HqlX5Z+GfOqSe6NITkpdSdSXDQH0rjRStjk0X1FZGsWelPs/J3yj3A8v6xjctFa/pZ86fX6jGsmCcH3R8lNdMnHw6AqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJRZJOLK2TfgCKsgnsQAAJAgAAAAAAAAAAAAAAAAA302FZJXJ1FdwNtFpet9eRNRXHyeqn7UkqS4o5HqIY4qME5ffgvGeWbulFAdNizFTV/mTfhE9YHggAAAAAAAAAAAAAAAAAAAAAAAmLpmkqUWZGjknjS7gZgAAAAAAAAAAXxzcH5T5RQAbSxqUXPHx3XgyTploTlB2i8oLIuqHPdAQ942giIN7xYltuBZOt0axnexknfBF0B1J2z0dF9ReNLHmfVDs/B5EZr+rY1i/D2A+kyyg9PLImnHp5R8fkaeSTXDZ6ePNOGKeNTfRJcM8yWzAqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwBBKZAAnkPj5EXTsmTuTYFQW5RUCdiAAN8GH1bbdUZ5I9E3HwIZJQ4ZWTcnb5YEAAAAAAAAAGmPDkyK4xbSAojqwSunskuxWWlkla2M3CUe+wHQ8yTbXu/wCxaGR5Fbbb8djjSlVXsOp1SA71JRVtxXxEusra9qcflnnwyuC2/cn15b3uBiAAAAAAAAAAAAAAAAAAAAAAAAWcaVjHXWr4E3cmBUAAAAAAAAAACUQS0BeNUFcJXFlEy0XugNUo5t1tPx5MpN3T7diapprY0VZdpbSXfyBhbT2ZZSvZkSi4umVA2e2xaMq5MYyp7l/sB0RmnGVd0cRvCVMxfLAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATZAAAkgASnRN2ioAkJBuyAAAAAAAAAAJSt77Euoy23A0xY4t3N7eDsjlSglD2nA8jdEOcn3A68mpin/c/8GEsqa2XJiALdTZFkAAAAAAAIAAAWv4KgACXv2AgAAAAAAAAAAAAAJbsgAAAAAAAAAAAAAAAkglcgWTJshhAaqSkumX6MynBwlTJsvGSaqatf9gMCU2uC08bjut4+SgGiaa+SjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABP2DXyBAAoCU6D3IAAAAAABaDSe6sjYJWW6WnvYFSDojiTqlaNfw8GrScWBxE0/B1PCou3wUbxpPlyA56oFpvqdjpfgCoLdL8EdLAgFulkqFruBQAAAABPYbUQAJ7iyCUrAgE9LIAAAAAAABKjYEAuofJWUekCAAAAAAAAAAAAAAAACUQAL9rJryURZMA1uLolEPmwLxnWz3T7ETx17o7xKp9mXxzcXfbuvIGINp41JdUOO68GTQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE0AVdyCUyAAAQAAAbaSPVmSO5Utmk19jh00nHPGjsknuAbxw3dIo9RijurZlOErvpZk4u+GgLSyzlP28dg8M1L3IhbLZNlvUyPZWBZ44pd0gklumwoyk+S3RFrdAZN77Wx6cu6aRvGPhUXUN92Bz+kuzsvCLitluzZJJ7Fv0A8sAAAAAAAAlOiABbq22RVu2AAAAAAACU6IAF1JdyZST5KLkMA0QAAAAAAAAAAAAAHRLR5Uk1G01exjLHKL3i0BUCgBJJUlAWFggA0AT8AWjJxdonIoyXVHbyiibsPdMCtEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALyh0xTu7AoSq7kACWiBZKAhglkAWjG09tytFoScbohuwNdKrzo7n+5yaKLeRy8I6gJ+CsotrYkkDmyRyPaMXS5IjCf8AY19zqtjkDGOOd22kXWPy3RdkUBCVE9iRQBboVZZIsogeOAAAAAAAAAAAAAAAAAAAAAEt2QAAAAAAAAAAAAAAD2fp+SOfT+k/zpUjTJCWLEnkh8bo8fT55YMqnHsetk+ofi8ai2r2dAZ5dJp243Fq+a7HLl+nZFmlDH7qPUSjlSUWk3ymYarHNSx5k3Fr2yYHlz0ubH+fHJfoU6GmfTZtTPGsMIwU5TV2zGcdJqZQjmgo5ZdkB887XKHc9x/S9PltYMyvwcub6NqIyfSlJeQPNJtG09DqYbvFKjGUJRdSTT8AECN1yiW1QFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEr5DZAAAAAAAAAAEkEp0B2aRVjk13NimGvRjXfkuBBK3QRKT7sACUiaAqTWxKRdR+NgKKJZRLpFkv2Aqo0rLUTTrZMPZe5pfdgeCAAAAAAAAAAAAAAAAAAAAAAAAAWn037eAKgAAAAAAAAAASnRAA1hqMkKqXB1Y/qU1Bwyx64t3ucAA9f/zHHlSWTauPg3x4sOoipY5r1OzT3PDomMnB3FtP4A9+Omy4nGeKnOq3JxS1WnUvVubUrfymeVh+qanE663JeGejp/rEZ/zEkwN5/UM2CajPGn1K68GinpNXGfqYV7VcmV9TSal9WSk/JMtFvN6fMl18pgUyfSNNmipY5uPVwedrvpE9LheSMlKKO7VYtXJY49G0OHA6ZYsmT6XKEk+txezA+TBMk02mQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACWqAhOhYAAAAAAB6Gn/3eP3NEU06/wBnjRt0v9AK0TQfTHmUV+pDzYY8zv7AWrwSlaOd6uNe2EmQ9TnkqjFR+QOxR2//ACRKWOC9+RI4njzzd5Jv9yPQxx/PNAdUtZhg9rk/go9fJtrHhXxZh16eHbqIesS/JBIDR5NXk2cqRHo27y5X+5zz1GSX9VGTk3y7AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWXBDJXBD5AJFqoi+xLaAt6kk7TaZti1ufG/bL9zn+5PewPVwfWckX79z0cP1bT5NnsfMb2LaA2+oRjHVz6K6W7VHMWk73KgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAnaiAAAAAAAAAB04ZZlCoOol+jNL803RhDPOEelcEPNk/uYHR6EV+aX7sfwYd0czuUbuyqA6nqYRVQj+5R6qb4SRnKUXDZbmYF5Zpy5kxH3RafJChJ8Jl44px3ewGbog39G3y39kax0ratR/cDkosscvFHZHAly1XwTL0I8tMDzxQJToCKBNhAQBYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJJuyoAsNytk2BZBkWNgDWxUte1FQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZAAAACVyQFyBJKi2tk2dkcFJbLdGigoqr6f8AcUIzS/Lz5JWBt22v0OlvDF22m/uR+Jxx/KrXwBlHAvDbNI4GqpJfcpLVtv2x/cpky5a/NSYHR6UVTlJ/ZbEyyYYb0mcDk3y2QB2vWRjtCJlPV5JPZ0YRFb7AWlknLmTKMuscn2r7l44L5l+wGIAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAEkACW7IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABO1fJAAAE0QAAAAAAAABp62Skurgq5ylzJkJNvZWXjinLhAZloq9jVYEl7pUWjgTeybA56LRjObSSbOpY0lulElJL+v9gOb0J/1KvuTHCm+W/hI2nkxx5V/JV6lLhbgSsCT4/cssdctRRg88mZucny2B1OWGK/NbKy1EV+VI5QAAAAAAAAAAAAAAAAAAAAAAAAAAF2AAAAAAAAAAAEkAlAQC6WxFbgVBNEAAAAAAAAAATRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABKIYAAAAAAAAAGmGXTLc3eSEXXJyADpeoXZFHqHW2xiNwNJZZy5ZRyb5ZMYybpRZdYJvsBkTR2Y/p2aX9Mn9kdWD6Lnk7lBRXmTA8lRb4RZYpPse9L6ZhwRvJlbfiJW9Ph/LCCXdyYHkw0k58Rb+yOzF9IzOnKKjF92y+f6pKMunHKKj/yI4p67LK/fJ/dgcgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXWyKFkwL34IYDaAhorRbkgCoJogAAALJgqWAgglkAAAAAAHRj0WfLi9THDqj8Gc8GSCuUGjq0P1CelhOCbqXHwdUfqnXirJGEnfdcgeOD2ZanRTpz0q356XwYxxfTsnVTyRA8wEyrqdcEAAAAAAAAAAAAAAAAAAAAAJvYCAAAAAAEtNVa5IAAAASyDbpioQ6uGBib4NNPPfQnJonUwxQ6PSldq2b6XV/h7ack2uwG+H6Rll+aKS/5nwdmL6Go75MsY/Y8+f1TK7Udvls55a7UT2eV/uB7v4LQYEnlyW13sh676dp7UIpv7HgNZMr/qZri0GpzP24pfqgPTzfX4r+TiX6nHL61q5Wk0k/8G2P6Dnkl1NRO3D9Bwwp5JuT8AeFPVajO6lOT+xMNFqcytY5O/J9Th+n6bC7hjV+WdKSSpID5rB9C1E/5jjFd/J6GL6Hp4U5tyZ6kpRjzJIxy6zBjVvIv0YHxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJTosUJToC3DDFgCooEp7AVBNbEACbIAE8kAAAAAAAAAASm/JZOVckKNojjkCHyAAAAAAAAAAAAAAAAAAAAAAUAAAAAEqrA6dZFqGF1s4nKet9Ux9Oi0s48VR5TAgAADWGLJkS6IuX6GR9P/AOH4Reibre/AHgR0WokrWN80den+j6rLtKPQvk+kenh6qnvt27GzaS3qgPExf+Hor+Zlv7I7MP0bS46uPU/k6p6nDjj7skV+pz5Pq2lhfv6q8AdMNNhgqjjiv0NEktkkeLm+vxX8rHf3OPL9bzzTp9P2A+lckuWjDLrdPivqyK/CPlMmuz5G3LJL9zCWWcuZMD6bJ9Zwx/Iv3OHP9cm5ex0jxbYA6831HNkfJzyzTldye5VRcnsmXjhk+wGQAAAAAAAAAAAAAAAAAAAEpNukBALyiopLuUAAAAAAAAAAAAAAAAAAAASQABNbhkoCOxBZkNVwBAAAAAAAAAAAAAC0TXaSowLRlQFWCXyQAAAAAAAAAAAAAAAAAAABOgAAAOrQaaOqzenKTT7AcpK5OjW6WWkzem3fdM57A97V4lk+hY5d4K0eAfU4I+p9F6Vv7T5dqnQEAlEADt0/1DNpsXp45VG7OIt0yatJtAd7+r6qv5rMZ/UNRNNPLKmctOxQF5ZpyW7f7lep+SVjm+Is0jp5PlpAY2Dpjpb5v9Eaeljxq3S+4HGlfZllgyPtX3Oh5cceJX9kVlqlVRjv5YFY6d3u/wBjVYYRT9q+7Zg9TkfevsZuUny2wOrrxw5e/wAFJalL8kf3OeyAAPpMX/h7DGnkm5HQ/o2j/tf7gfJg+ky/QMEr9Obi+x4uv0OTRZematPh+QOUAAAAAAAAAAAAANMK3bKUa4d5NLmgKT5ZQtN+5lQAAAAAAAAAAAAAAAAAAAAACUT2KkpgSO/BAvcA1TILPcqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADp0GT09Zjd1vucxaDqafhge39fx3DHlVHhn0H1SPqfSoTb3STPnwPpPoklk0Dhe9tHz+qh6epyR8SZ7X/h2X8PLH5s8v6nDo12VfIHIAAB26eOJ4V1zUXZxE2B6Keniv5i/Yp6uCP8AU/0RwADslnxKW0W/llHq5VUYpHMANJZ8kuZMo5N9yC0ccpcICoNY4ZPk0WnSVsDmqy6xSlwjoUcUVUpJMr60I/lTbAotPK9zRYIrncpPUzfFIyc5PlsD7t8bFabILKwIUHe7Pnfr+rjlyrDFfk5Z9I9k2fF/UJ9etyv5A5gAAAAAAAAAALxj3Kxi5cF02nutgHTTL4tp/oyLT7lXKpbbAUlyQSyAAAAAAAAAAAAAAAAAAAAAAAAAJsEEgOCCQBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPpOhaj6Hu+I2fNn0v09vL9GkvCaPm2qbTA9f8A8Ov+PlV9jm+s/wD9hkNvoEktVJPuin12CjrrXdWB5oAAF/Tk1dFDpjqOiKXSnQGSxSfKZZYJPyv0LvWTraKRV6zK1Vr9gEdM297/AGNPw8Y3dKvLMHmyP+plHJy5bYHVeGPLT+xDz40qUWzlsAbvUyqoqkZSySly2VJUW3sgIsGiwy/qVGkNPe/KA5yyhJ9mdLjCC9zSIebGlsmwP//Z";

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setToday(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Generate falling hearts and automatic notes
  useEffect(() => {
    const heartInterval = setInterval(() => {
      const newHeart: HeartEffect = {
        id: Date.now(),
        x: Math.random() * 100,
        duration: 5 + Math.random() * 10,
        size: 15 + Math.random() * 25,
        delay: Math.random() * 2
      };
      setHearts(prev => [...prev.slice(-20), newHeart]);
    }, 2000);

    const noteInterval = setInterval(() => {
      const randomPrayer = PRAYERS[Math.floor(Math.random() * PRAYERS.length)];
      const newNote: LoveNote = {
        id: Date.now() + Math.random(),
        text: randomPrayer,
        x: 50 + (Math.random() - 0.5) * 80, // Random horizontal position
        y: 200 + Math.random() * 400 // Random vertical position
      };
      setNotes(prev => [...prev, newNote]);

      setTimeout(() => {
        setNotes(prev => prev.filter(n => n.id !== newNote.id));
      }, 3000); // Show for 3 seconds
    }, 4000); // New note every 4 seconds

    return () => {
      clearInterval(heartInterval);
      clearInterval(noteInterval);
    };
  }, []);

  const handleHeartClick = useCallback((e: React.MouseEvent, heartId: number) => {
    const randomPrayer = PRAYERS[Math.floor(Math.random() * PRAYERS.length)];
    const newNote: LoveNote = {
      id: Date.now(),
      text: randomPrayer,
      x: (e.clientX / window.innerWidth) * 100,
      y: e.clientY
    };
    setNotes(prev => [...prev, newNote]);
    setHearts(prev => prev.filter(h => h.id !== heartId));

    setTimeout(() => {
      setNotes(prev => prev.filter(n => n.id !== newNote.id));
    }, 2000);
  }, []);

  const target = 50000; // 50,000
  const current = data?.currentAmount || 0;
  const progress = Math.min((current / target) * 100, 100);

  const deadline = new Date(2026, 9, 1); // October 1st, 2026
  const daysLeft = Math.max(differenceInDays(deadline, today), 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) return;

    setLoading(true);
    try {
      await onUpdate(amount);
      setAddAmount('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 relative">
      {/* Falling Hearts Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <AnimatePresence>
          {hearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: '110vh', opacity: [0, 1, 1, 0] }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: heart.duration, ease: "linear", delay: heart.delay }}
              style={{ left: `${heart.x}%`, position: 'absolute' }}
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => handleHeartClick(e, heart.id)}
            >
              <Heart 
                size={heart.size} 
                className="text-red-400/30 fill-red-400/20 hover:text-red-500 hover:fill-red-500 transition-colors" 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Love Notes Layer */}
      <AnimatePresence>
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.5, y: note.y }}
            animate={{ opacity: 1, scale: 1, y: note.y - 100 }}
            exit={{ opacity: 0, scale: 1.5 }}
            style={{ left: `${note.x}%`, top: 0, position: 'fixed', transform: 'translateX(-50%)' }}
            className="z-[100] bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-red-100 whitespace-nowrap pointer-events-none"
          >
            <p className="text-red-600 font-black text-lg">{note.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <Target size={28} className="lg:size-8 animate-pulse" />
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">تحدي الـ ٥٠ ألف</h2>
          </div>
          <p className="text-muted-foreground font-bold text-base lg:text-lg">نتحدى تكاليف الزواج معاً.. خطوة بخطوة نحو الهدف</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-border shadow-xl">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">تاريخ اليوم</p>
              <p className="text-sm font-black text-foreground">{format(today, 'EEEE, d MMMM yyyy', { locale: ar })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[3.5rem] border border-border shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors" />
          
          <div className="relative z-10 space-y-8 lg:space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] lg:text-sm font-black text-primary uppercase tracking-[0.2em]">المبلغ المجموع</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl lg:text-6xl font-black text-foreground tracking-tighter">{current.toLocaleString()}</span>
                  <span className="text-lg lg:text-xl font-black text-muted-foreground">دج</span>
                </div>
              </div>
              <div className="sm:text-right space-y-1">
                <p className="text-[10px] lg:text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">الهدف النهائي</p>
                <p className="text-xl lg:text-2xl font-black text-foreground opacity-60 tracking-tight">٥٠,٠٠٠ دج</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded-full overflow-hidden border-4 border-white shadow-inner relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-primary/80 relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:2rem_2rem] animate-[shimmer_2s_linear_infinite]" />
                </motion.div>
              </div>
              <div className="flex justify-between items-center px-2">
                <p className="text-sm font-black text-primary">{progress.toFixed(1)}% مكتمل</p>
                <p className="text-sm font-black text-muted-foreground">متبقي {(target - current).toLocaleString()} دج</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 pt-4">
              <div className="p-4 lg:p-6 bg-primary/5 rounded-2xl lg:rounded-3xl border border-primary/10 flex items-center gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl lg:rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                  <TrendingUp size={20} className="lg:size-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">معدل الإنجاز</p>
                  <p className="text-base lg:text-lg font-black text-foreground">ممتاز جداً</p>
                </div>
              </div>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="p-4 lg:p-6 bg-red-500/5 rounded-2xl lg:rounded-3xl border border-red-500/10 flex items-center gap-4 hover:bg-red-500/10 transition-colors text-right"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl lg:rounded-2xl flex items-center justify-center text-red-500 shadow-lg shadow-red-500/10">
                  <Sparkles size={20} className="lg:size-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">تعديل المجموع</p>
                  <p className="text-base lg:text-lg font-black text-red-500">تصفير العداد</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Countdown Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-foreground text-background p-6 lg:p-10 rounded-3xl lg:rounded-[3.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
          <div className="relative z-10 space-y-6 lg:space-y-8">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 rounded-xl lg:rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl border border-white/10">
              <Clock size={24} className="lg:size-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl lg:text-3xl font-black tracking-tight">العد التنازلي</h3>
              <p className="text-background/60 font-bold text-sm lg:text-base">حتى نهاية التحدي (أكتوبر ٢٠٢٦)</p>
            </div>
            <div className="space-y-1">
              <span className="text-6xl lg:text-8xl font-black tracking-tighter text-primary">{daysLeft}</span>
              <p className="text-xl lg:text-2xl font-black tracking-widest uppercase opacity-80">يوم متبقي</p>
            </div>
          </div>
          <div className="relative z-10 pt-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
              <Heart size={16} className="text-red-400 fill-red-400" />
              <p className="text-xs font-bold leading-relaxed">كل يوم يقربنا أكثر من حلمنا الجميل</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Money Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[3.5rem] border border-border shadow-2xl"
      >
        <form onSubmit={handleAdd} className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs lg:text-sm font-black text-muted-foreground uppercase tracking-widest px-2">إضافة مبلغ جديد للتحدي</label>
            <div className="relative">
              <input 
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="أدخل المبلغ هنا..."
                className="w-full bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl lg:rounded-3xl px-6 lg:px-8 py-4 lg:py-6 text-xl lg:text-2xl font-black transition-all outline-none"
              />
              <div className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 text-muted-foreground font-black">دج</div>
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading || !addAmount}
            className="w-full lg:w-auto px-10 lg:px-12 py-4 lg:py-6 bg-primary text-primary-foreground rounded-2xl lg:rounded-3xl font-black text-lg lg:text-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={24} />
                <span>إضافة للمجموع</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Home Appliances Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[3.5rem] border border-border shadow-2xl"
      >
        <div className="space-y-6 lg:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-primary">
                <Sparkles size={28} className="lg:size-8" />
                <h3 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground">تحدي أجهزة البيت</h3>
              </div>
              <p className="text-muted-foreground font-bold text-sm lg:text-base">قائمة الأجهزة الأساسية التي نحتاجها لمنزلنا السعيد</p>
            </div>
            {data?.appliances && (
              <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">نسبة الإنجاز</p>
                <p className="text-xl font-black text-foreground">
                  {data.appliances.filter(a => a.bought).length} / {data.appliances.length}
                </p>
              </div>
            )}
          </div>

          {data?.appliances && (
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.appliances.filter(a => a.bought).length / data.appliances.length) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-primary/60"
                />
              </div>
              <p className="text-[10px] font-black text-muted-foreground text-center uppercase tracking-widest">
                تم شراء {data.appliances.filter(a => a.bought).length} من أصل {data.appliances.length} أجهزة
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {data?.appliances?.map((appliance) => (
              <button
                key={appliance.id}
                onClick={() => onToggleAppliance(appliance.id)}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all flex items-center justify-between group",
                  appliance.bought 
                    ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" 
                    : "bg-muted/30 border-transparent hover:border-primary/30"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    appliance.bought ? "bg-primary text-white" : "bg-white text-muted-foreground group-hover:text-primary"
                  )}>
                    <CheckCircle2 size={24} className={cn(appliance.bought && "animate-bounce")} />
                  </div>
                  <span className={cn(
                    "text-lg lg:text-xl font-black",
                    appliance.bought ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {appliance.name}
                  </span>
                </div>
                {appliance.bought && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-primary/10 px-3 py-1 rounded-full"
                  >
                    <span className="text-xs font-black text-primary">تم الشراء</span>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-[3rem] max-w-md w-full space-y-8 shadow-2xl"
          >
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Sparkles size={40} />
              </div>
              <h3 className="text-2xl font-black text-foreground">هل أنت متأكد؟</h3>
              <p className="text-muted-foreground font-bold">سيتم تصفير المبلغ المجموع بالكامل والبدء من جديد.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-4 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all"
              >
                إلغاء
              </button>
              <button 
                onClick={async () => {
                  setLoading(true);
                  await onReset();
                  setLoading(false);
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all"
              >
                تصفير الآن
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
