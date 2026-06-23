import { useState, useRef, useEffect } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const show = (message) => {
    setToast(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  return [toast, show];
}
