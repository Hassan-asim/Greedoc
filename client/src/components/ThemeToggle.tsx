import React from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../contexts/ThemeContext'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <FiMoon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <FiSun className="h-5 w-5 text-yellow-500" />
      )}
    </button>
  )
}
