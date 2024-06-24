import React, { useState, useEffect } from "react";
import "./App.css";

interface FormData {
  [key: string]: string;
}

interface TableData extends FormData {
  id: number;
}

const Form: React.FC<{ onSubmit: (data: FormData) => void }> = ({
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fields, setFields] = useState<string[]>([
    "field 1",
    "field 2",
    "field 3",
    "field 4",
    "field 5",
  ]);

  const addField = () => {
    setFields([...fields, `field ${fields.length + 1}`]);
  };

  const validate = (data: FormData) => {
    const errors: FormData = {};
    fields.forEach((field) => {
      if (!data[field]) {
        errors[field] = "This field is required";
      }
    });
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({});
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-form">
      {fields.map((field) => (
        <div key={field}>
          <label>{field}</label>
          <input
            type="text"
            name={field}
            value={formData[field] || ""}
            onChange={handleChange}
          />
          {errors[field] && (
            <span style={{ color: "red" }}>{errors[field]}</span>
          )}
        </div>
      ))}
      <div className="buttons">
        <button type="submit" disabled={isSubmitting} className="btn-submit">
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          onClick={addField}
          disabled={fields.length === 15}
          className="btn-add-form"
        >
          {fields.length === 15
            ? "Максимальный лимит полей 15"
            : "Добавить поле"}
        </button>
      </div>
    </form>
  );
};

const Table: React.FC<{ data: TableData[] }> = ({ data }) => {
  if (data.length === 0) {
    return <div>No data available</div>;
  }

  let columns: string[] = [];

  for (let i = 0; i < data.length; i++) {
    columns = Object.keys(data[i]).filter((key) => key !== "id");
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const App: React.FC = () => {
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [nextId, setNextId] = useState(1);

  const handleFormSubmit = async (data: FormData) => {
    try {
      const response = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.message}`);
      }

      const newData = { ...data, id: nextId };
      setNextId(nextId + 1);
      setTableData((prev) => [...prev, newData]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch("http://localhost:3000/posts");
        const response = await data.json();
        setTableData(response);
      } catch (error) {
        console.error("Error: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dynamic Form and Table</h1>
      <Form onSubmit={handleFormSubmit} />
      <Table data={tableData} />
    </div>
  );
};

export default App;
