import React, { useState } from "react";
import "./App.css"; // Importing the CSS file to style our application

const App = () => {
  const [inputText, setInputText] = useState(""); // Holds the text entered by the user
  const [outputPrompt, setOutputPrompt] = useState(""); // Holds the generated AI prompt
  const [loading, setLoading] = useState(false); // Indicates whether the conversion is in progress
  const [copied, setCopied] = useState(false); // Indicates whether the prompt has been copied
  const [isEditing, setIsEditing] = useState(false); // Indicates whether the user is in edit mode
  const [promptType, setPromptType] = useState("creative"); // Holds the selected prompt type

  // Function to handle the conversion of input text to an AI prompt
  const handleConvert = async () => {
    if (!inputText.trim()) {
      setOutputPrompt("Please enter some text."); // Prompt the user to enter text
      return; // Exit the function if no text is provided
    }

    setLoading(true); // Set loading state to true to indicate processing
    setOutputPrompt(""); // Clear any previous output
    setCopied(false); // Reset copied state

    try {
      const generatedPrompt = await generateAIPrompt(inputText, promptType);
      setOutputPrompt(generatedPrompt); // Update the output prompt with the generated text
    } catch (error) {
      console.error("Error generating AI prompt:", error); // Log the error for debugging
      setOutputPrompt("Error generating prompt. Please try again."); // Inform the user of the error
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Function to copy the output prompt to the clipboard
  const handleCopy = () => {
    navigator.clipboard
      .writeText(outputPrompt) // Copy the output prompt to clipboard
      .then(() => {
        setCopied(true); // Set copied state to true
        setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
      })
      .catch((err) => console.error("Failed to copy: ", err)); // Handle any errors
  };

  // Function to start editing the output prompt
  const handleEdit = () => {
    setInputText(outputPrompt); // Set the input text to the output prompt for editing
    setIsEditing(true); // Set editing mode to true
  };

  // Function to finish editing and return to the generated prompt
  const handleDone = () => {
    setOutputPrompt(inputText); // Update the output prompt with the edited input
    setIsEditing(false); // Exit editing mode
  };

  // Function to interact with the AI API and generate a prompt
  const generateAIPrompt = async (inputText, promptType) => {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "user",
              content: `Convert the following text into a ${promptType} AI prompt: "${inputText}"`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error("No choices returned from API");
    }
  };

  // Render the application UI
  return (
    <div className="app">
      <h1>AI Prompt Converter</h1>
      {!isEditing && (
        <>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
            className="input-textarea"
          />
          <select
            value={promptType}
            onChange={(e) => setPromptType(e.target.value)}
            className="prompt-type-dropdown"
          >
            <option value="creative">Creative</option>
            <option value="summarization">Summarization</option>
            <option value="clarification">Clarification</option>
            <option value="question">Question</option>
            <option value="reasoning">Reasoning</option>
            <option value="others">Others</option>
          </select>
          <button
            onClick={handleConvert}
            disabled={loading}
            className="convert-button"
          >
            {loading ? "Converting..." : "Convert to AI Prompt"}
          </button>
          {loading && <div className="spinner"></div>}
        </>
      )}
      {outputPrompt && !isEditing && (
        <div className="output-container">
          <p className="output-prompt">{outputPrompt}</p>
          <div className="button-group">
            <button onClick={handleCopy} className="copy-button">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={handleEdit} className="edit-button">
              Edit
            </button>
          </div>
        </div>
      )}
      {isEditing && (
        <div className="editing-container">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Edit your text here..."
            className="input-textarea"
          />
          <button onClick={handleDone} className="done-button">
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
