
import React, { useEffect, useState } from "react";
import "./App.css";

const API = "https://ex5-online-survey-api.onrender.com/api/survey";

function App() {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const qRes = await fetch(`${API}/questions`);
      const qData = await qRes.json();
      setQuestions(qData.questions || []);

      const rRes = await fetch(`${API}/responses`);
      const rData = await rRes.json();
      setResponses(Array.isArray(rData) ? rData : rData.responses || []);
    } catch (error) {
      setMessage("Unable to connect to server.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAnswer = (id, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (
      questions.some(
        (q) =>
          answers[q.id] === undefined ||
          answers[q.id] === "" ||
          (Array.isArray(answers[q.id]) && answers[q.id].length === 0)
      )
    ) {
      setMessage("Please answer all five questions.");
      return;
    }

    const formattedResponses = questions.map((q) => ({
      questionId: q.id,
      questionText: q.text,
      type: q.type,
      options: q.options || [],
      answer: answers[q.id]
    }));

    const payload = {
      respondentName: name,
      responses: formattedResponses
    };

    try {
      const url = editingId
        ? `${API}/responses/${editingId}`
        : `${API}/responses`;

      const result = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setMessage(data.message || "Success!");
      setName("");
      setAnswers({});
      setEditingId(null);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editResponse = (item) => {
    setName(item.respondentName);
    setEditingId(item.id);

    const previousAnswers = {};
    item.responses.forEach((r) => {
      previousAnswers[r.questionId] = r.answer;
    });

    setAnswers(previousAnswers);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteResponse = async (id) => {
    if (!window.confirm("Delete this response?")) return;

    try {
      const result = await fetch(`${API}/responses/${id}`, {
        method: "DELETE"
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage(data.message || "Response deleted.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="app">
      <h1>Online Survey</h1>
      <p>Share your answers with us</p>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />

        {questions.map((q, index) => (
          <div className="question" key={q.id}>
            <h3>{index + 1}. {q.text}</h3>

            {q.type === "text" ? (
              <input
                type="text"
                value={answers[q.id] || ""}
                onChange={(e) => handleAnswer(q.id, e.target.value)}
              />
            ) : q.type === "checkbox" ? (
              (q.options || []).map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={(answers[q.id] || []).includes(option)}
                    onChange={(e) => {
                      const current = answers[q.id] || [];
                      handleAnswer(
                        q.id,
                        e.target.checked
                          ? [...current, option]
                          : current.filter((v) => v !== option)
                      );
                    }}
                  />
                  {option}
                </label>
              ))
            ) : (
              (q.options || []).map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={option}
                    checked={answers[q.id] === option}
                    onChange={() => handleAnswer(q.id, option)}
                  />
                  {option}
                </label>
              ))
            )}
          </div>
        ))}

        <button type="submit">
          {editingId ? "Update Response" : "Submit Survey"}
        </button>
      </form>

      <h2>Submitted Responses</h2>

      {responses.map((item) => (
        <div className="response" key={item.id}>
          <h3>{item.respondentName}</h3>

          {item.responses.map((r, index) => (
            <p key={index}>
              {r.questionText}: {Array.isArray(r.answer)
                ? r.answer.join(", ")
                : r.answer}
            </p>
          ))}

          <button type="button" onClick={() => editResponse(item)}>
            Edit
          </button>

          <button
            type="button"
            onClick={() => deleteResponse(item.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
