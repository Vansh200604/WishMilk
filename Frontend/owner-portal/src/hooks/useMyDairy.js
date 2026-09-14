import { useEffect, useState } from "react";
import { dairyApi } from "../api/dairy.js";

// Every owner page needs to know "does this owner have a dairy yet, and
// which one". A 404 here just means they haven't registered one — that's
// an expected state, not an error, so it's swallowed rather than toasted.

// export function useMyDairy() {
//   const [dairy, setDairy] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const reload = () => {
//     setLoading(true);
//     dairyApi
//       .getMyDairy()
//       .then((res) => setDairy(res.data))
//       .catch(() => setDairy(null))
//       .finally(() => setLoading(false));
//   }; 

//   useEffect(reload, []);

//   return { dairy, setDairy, loading, reload };
// }




export function useMyDairy() {
  const [dairy, setDairy] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);

    try {
      const res = await dairyApi.getMyDairy();
      setDairy(res.data);
    } catch (err) {

      if (err.response?.status === 404) {
        // Dairy really doesn't exist
        setDairy(null);
      } else {
        console.error(err);
        // Keep previous dairy
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      const fetchData = async () => {
          await reload();
      };

      fetchData();
  }, []);

  return { dairy, setDairy, loading, reload };
}