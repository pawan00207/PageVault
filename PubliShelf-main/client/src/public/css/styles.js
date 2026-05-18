const categoryBtnStyle = "block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700";
const navBtnStyle =
  "text-gray-700 hover:text-purple-600 transition-colors px-3 py-2";
const purpleBtnStyle =
  "bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors hover:translate-y-[-2px] transition-all duration-500 linear";
const indigoBtnStyle =
  "bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors hover:translate-y-[-2px] transition-all duration-500 linear";
const easeTransition = "transition-all duration-300 ease";
const bookCardStyle = `bg-white rounded-lg shadow-md overflow-hidden ${easeTransition} hover:-translate-y-[5px] hover:shadow-lg`;
const faqBtnStyle = `${easeTransition} hover:bg-[#f3f4f6]`;
const faqContentStyle = `${easeTransition} hidden p-4`;
const styles = {
  categoryBtnStyle,
  navBtnStyle,
  purpleBtnStyle,
  indigoBtnStyle,
  easeTransition,
  bookCardStyle,
  faqBtnStyle,
  faqContentStyle,
};

export default styles;
