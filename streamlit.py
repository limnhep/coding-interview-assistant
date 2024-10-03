import streamlit as st  # Changed import to use streamlit directly
import requests
import json

# Constants
BACKEND_URL = "http://localhost:3001/generate-code"

st.set_page_config(page_title="Code Generation Assistant", layout="wide")

st.title("Coding Interview Prep Assistant")

st.sidebar.header("Instructions")
st.sidebar.markdown("""
- Enter your coding problem in the text area.
- Click the "Generate Code" button to receive a solution.
- Review the generated code and explanation.
- For further learning, explore related coding concepts.
""")

user_input = st.text_area("Enter your code request:", 
                          "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory. (Credit to Leetcode)", height=150)

if st.button("Generate Code"):
    if user_input:
        with st.spinner("Generating code..."):
            try:
                response = requests.post(BACKEND_URL, json={"userInput": user_input})
                response.raise_for_status()
                result = response.json()

                st.subheader("Generated Code:")
                st.code(result["code"], language="python")

                st.subheader("Explanation:")
                st.markdown(result["explanation"])
            except requests.exceptions.RequestException as e:
                st.error(f"Error communicating with the backend: {str(e)}")
    else:
        st.warning("Please enter a coding problem or question.")