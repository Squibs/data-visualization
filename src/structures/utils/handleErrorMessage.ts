/** Returns error message if it is an error object, otherwise stringifies the error. */
const handleErrorMessage = (error: unknown) => {
  // if error is an error object return the error message
  if (error instanceof Error) return error.message;

  // return error as a string
  return `${error}`;
};

export default handleErrorMessage;
