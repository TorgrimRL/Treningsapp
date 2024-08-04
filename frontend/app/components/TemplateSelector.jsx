import React from "react";
const templates = [
  {
    name: "Strength Training",
    days: 3,
    muscleGroups: [
      ["Chest", "Back", "Legs"],
      ["Arms", "Shoulders", "Abs"],
      ["Legs", "Back", "Calves"],
    ],
  },
  {
    name: "Hypertrophy Training",
    days: 4,
    muscleGroups: [
      ["Chest", "Triceps"],
      ["Back", "Biceps"],
      ["Legs", "Shoulders"],
      ["Abs", "Calves"],
    ],
  },
];

const TemplateSelector = ({ onSelectTemplate }) => {
  const handleSelect = (template) => {
    onSelectTemplate(template);
  };

  return (
    <div className="mt-8 text-white bold ">
      <div>
        <header className=" flex justify-between items-center mb-5 p-5">
          <h1 className="text-2xl m-0">Templates</h1>
          <button
            //   onClick={}
            className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
          >
            + NEW
          </button>
        </header>
      </div>
      <div>
        <ul className="list-none p-0">
          {templates.map((template) => (
            <li key={template.name} className="mb-2">
              <button
                onClick={() => handleSelect(template)}
                className="bg-darkGray text-white py-2 px-4 w-full hover:bg-gray-700"
              >
                {template.name} - {template.days} Days
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TemplateSelector;
