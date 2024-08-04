import React, { useState } from "react";
import Modal from "react-modal";
import TemplateOverviewModal from "./TemplatePreviewModal";
import { templates } from "../constants/constants";

Modal.setAppElement("#root");

const TemplateSelector = ({ onSelectTemplate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);

    // onSelectTemplate(template);
  };

  const handleModalSave = () => {
    if (onSelectTemplate && typeof onSelectTemplate === "function") {
      onSelectTemplate(selectedTemplate);
    }
    // onSelectTemplate(template);
    setIsModalOpen(false);
  };

  return (
    <div className="mt-8 text-white bold ">
      <div>
        <header className=" flex justify-between items-center mb-5 p-5">
          <h1 className="text-2xl m-0">Templates</h1>
          {/* <button
            //   onClick={}
            className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
          >
            + NEW
          </button> */}
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
                {template.name} - {template.days}/week
              </button>
            </li>
          ))}
        </ul>
      </div>
      <TemplateOverviewModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        template={selectedTemplate}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default TemplateSelector;
