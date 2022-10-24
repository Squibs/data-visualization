import handleErrorMessage from './handleErrorMessage';

/** Takes (API URL, setData, setError, setLoading)  */
const getDataFromAPI = async (
  url: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setData: React.Dispatch<React.SetStateAction<any>>,
) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: Status ${response.status}`); // not the endpoint we want

    const actualData = await response.json();

    setData(actualData);
  } catch (err: any) {
    setError(handleErrorMessage(err));
  } finally {
    setLoading(false);
  }
};

export default getDataFromAPI;
