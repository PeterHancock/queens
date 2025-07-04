import { create } from './lcg';
import type { Tuple } from './types';

export const random = (lcg?: () => number) => {
  const r = lcg || create(0n).rand;
  return {
    rand: rand(r),
    shuffle: shuffle(r),
    shuffleT: shuffleT(r),
  };
};

export const rand = (lcg?: () => number) => {
  const r = lcg || create(0n).rand;
  return (n: number) => Math.floor(n * r());
};

export const shuffle = (lcg?: () => number) => {
  const randFunc = rand(lcg);

  return <T>(array: T[]): T[] => {
    const shuffledArray = [...array];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(randFunc(i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }

    return shuffledArray;
  };
};

export const shuffleT = (lcg?: () => number) => {
  const shuff = shuffle(lcg);
  return <T, N extends number>(array: Tuple<T, N>): Tuple<T, N> =>
    shuff(array) as unknown as Tuple<T, N>;
};
