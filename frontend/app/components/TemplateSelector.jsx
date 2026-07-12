import { useState } from "react";
import TemplateOverviewModal from "./TemplatePreviewModal";
import { templates } from "../constants/constants";

const TemplateSelector = ({ onSelectTemplate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    if (onSelectTemplate && typeof onSelectTemplate === "function") {
      onSelectTemplate(selectedTemplate);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="text-white">
      <header className="flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between md:px-0">
        <h1 className="m-0 text-2xl">Templates</h1>
        <a
          className="inline-flex items-center justify-center bg-red-600 px-4 py-2 text-center text-lg text-white transition-colors hover:bg-red-700 md:rounded"
          href="/mesocycles-new"
        >
          Build a training block from scratch
        </a>
      </header>
      <p className="px-4 pb-6 text-center text-gray-300 md:px-0">
        or select a template
      </p>
      <div>
        <ul
          data-testid="templates-grid"
          className="grid list-none grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-3"
        >
          {templates.map((template, index) => (
            <li
              key={template.name + "-" + index}
              data-testid={"template-card-" + index}
              className="h-full min-w-0"
            >
              <button
                onClick={() => handleSelect(template)}
                className="flex h-full w-full min-w-0 flex-col items-start justify-center bg-darkGray px-4 py-3 text-left text-white hover:bg-gray-700 md:rounded-lg md:border md:border-gray-700"
              >
                <span className="w-full break-words font-semibold">
                  {template.name}
                </span>
                <span className="text-sm text-gray-300">
                  {template.days} days/week
                </span>
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
