import { useEffect, useMemo, useState } from 'react';

const ASCII_CHAR = '█';
const MAX_WIDTH = 40;
const MAX_HEIGHT = 24;

const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const sampleImageToAscii = (image, targetWidth, targetHeight) => {
  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  const { data } = ctx.getImageData(0, 0, targetWidth, targetHeight);

  const rows = [];
  for (let y = 0; y < targetHeight; y += 1) {
    const row = [];
    for (let x = 0; x < targetWidth; x += 1) {
      const index = (y * targetWidth + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (a < 80) {
        row.push({ char: ' ', color: 'transparent' });
      } else {
        row.push({ char: ASCII_CHAR, color: `rgb(${r}, ${g}, ${b})` });
      }
    }
    rows.push(row);
  }

  return rows;
};

const resolveSrc = (value) => {
  if (!value) return null;
  if (/^https?:/i.test(value)) {
    return value;
  }
  const sanitized = value.startsWith('/') ? value : `/${value}`;
  return `${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'}${sanitized}`;
};

const AsciiPortrait = ({ src, precomputed, className = '', width = MAX_WIDTH, height = MAX_HEIGHT }) => {
  const [asciiRows, setAsciiRows] = useState(precomputed ?? null);
  const [error, setError] = useState(null);
  const resolvedSrc = useMemo(() => resolveSrc(src), [src]);

  useEffect(() => {
    if (precomputed && Array.isArray(precomputed) && precomputed.length > 0) {
      setAsciiRows(precomputed);
      setError(null);
      return;
    }

    if (!resolvedSrc) {
      setAsciiRows(null);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (cancelled) {
        return;
      }
      const aspect = image.width / image.height;
      const maxW = Math.min(width, MAX_WIDTH);
      const maxH = Math.min(height, MAX_HEIGHT);
      let targetWidth = Math.floor(maxW);
      let targetHeight = Math.floor(targetWidth / aspect * 0.55);

      if (targetHeight > maxH) {
        targetHeight = Math.floor(maxH);
        targetWidth = Math.floor(targetHeight * aspect / 0.55);
      }

      targetWidth = Math.max(16, targetWidth);
      targetHeight = Math.max(16, targetHeight);

      const rows = sampleImageToAscii(image, targetWidth, targetHeight);
      setAsciiRows(rows);
      setError(null);
    };
    image.onerror = () => {
      if (!cancelled) {
        setAsciiRows(null);
        setError('Failed to load image');
      }
    };
    image.src = resolvedSrc;

    return () => {
      cancelled = true;
    };
  }, [resolvedSrc, width, height, precomputed]);

  const fallbackAscii = useMemo(
    () =>
      [
        '   _________  ',
        '  /        /| ',
        ' /  ASCII  / |',
        '+---------+  |',
        '|  PORTRAIT| |',
        '|          | |',
        '|  Upload  | /',
        '+__________+/ ',
      ].join('\n'),
    [],
  );

  if (!resolvedSrc) {
    return (
      <pre className={`ascii-fallback ${className}`}>
        {fallbackAscii}
      </pre>
    );
  }

  if (error) {
    return (
      <pre className={`ascii-fallback ${className}`}>
        {fallbackAscii}
      </pre>
    );
  }

  if (!asciiRows) {
    return (
      <div className={`ascii-loading ${className}`}>
        <span className="ascii-loading-dot" />
        <span className="ascii-loading-dot" />
        <span className="ascii-loading-dot" />
      </div>
    );
  }

  return (
    <pre className={`ascii-portrait ${className}`}>
      {asciiRows.map((row, rowIdx) => (
        <span key={`row-${rowIdx}`}>
          {row.map((cell, cellIdx) => (
            <span
              key={`cell-${rowIdx}-${cellIdx}`}
              style={{ color: cell.color }}
            >
              {cell.char}
            </span>
          ))}
          {'\n'}
        </span>
      ))}
    </pre>
  );
};

export default AsciiPortrait;
