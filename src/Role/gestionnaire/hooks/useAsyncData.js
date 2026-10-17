// Charge une ressource asynchrone (service mocké) avec états loading/error.
import { useCallback, useEffect, useState } from "react";

export function useAsyncData(loader, deps = [], initial = null) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memorized = useCallback(loader, deps);

  const recharger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resultat = await memorized();
      setData(resultat);
      return resultat;
    } catch (err) {
      setError(err?.message || "Erreur de chargement");
      return null;
    } finally {
      setLoading(false);
    }
  }, [memorized]);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { data, setData, loading, error, recharger };
}
