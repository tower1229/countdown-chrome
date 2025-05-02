import React, { ReactNode } from "react";

interface ChromeLayoutProps {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  rightAction?: ReactNode;
}

/**
 * A layout component that provides consistent Chrome UI styling
 */
const ChromeLayout: React.FC<ChromeLayoutProps> = ({
  title,
  children,
  onBack,
  rightAction,
}) => {
  return (
    <div className="chrome-container">
      <div className="chrome-header">
        {onBack && (
          <button
            onClick={onBack}
            className="chrome-back-button"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
        <h1 className="chrome-header-title">{title}</h1>
        {rightAction && (
          <div className="chrome-header-action">{rightAction}</div>
        )}
      </div>
      <div className="chrome-content">{children}</div>
    </div>
  );
};

export default ChromeLayout;
