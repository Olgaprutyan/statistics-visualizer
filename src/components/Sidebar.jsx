import { useEffect, useState } from 'react'
import { textbook } from '../data/textbook'

function Sidebar() {
  const currentChapter = textbook.find((chapter) => chapter.isCurrent)

  const sections = currentChapter?.sections ?? []

  const [activeSection, setActiveSection] = useState(
    sections[0]?.id ?? 'question',
  )

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean)

    if (sectionElements.length === 0) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((firstEntry, secondEntry) => {
            return firstEntry.boundingClientRect.top -
              secondEntry.boundingClientRect.top
          })

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id)
        }
      },
      {
        /*
         * Активной считается секция, находящаяся примерно
         * в верхней трети экрана.
         */
        rootMargin: '-20% 0px -65% 0px',
        threshold: 0,
      },
    )

    sectionElements.forEach((sectionElement) => {
      observer.observe(sectionElement)
    })

    return () => {
      observer.disconnect()
    }
  }, [sections])

  const activeSectionIndex = sections.findIndex(
    (section) => section.id === activeSection,
  )

  function handleSectionClick(sectionId) {
    setActiveSection(sectionId)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">S</div>

        <div>
          <p className="sidebar__project-name">StatLab</p>

          <p className="sidebar__project-description">
            Интерактивная статистика
          </p>
        </div>
      </div>

      <nav
        className="sidebar__navigation"
        aria-label="Навигация по учебнику"
      >
        {textbook.map((chapter) => (
          <div className="sidebar__chapter" key={chapter.id}>
            <div
              className={
                chapter.isCurrent
                  ? 'sidebar__chapter-title sidebar__chapter-title--active'
                  : 'sidebar__chapter-title'
              }
            >
              {chapter.number && (
                <span className="sidebar__chapter-number">
                  {chapter.number}.
                </span>
              )}

              <span>{chapter.title}</span>
            </div>

            {chapter.isCurrent && chapter.sections && (
              <div className="sidebar__sections">
                {chapter.sections.map((section, sectionIndex) => {
                  const isActive = section.id === activeSection
                  const isCompleted = sectionIndex < activeSectionIndex

                  let linkClassName = 'sidebar__section-link'

                  if (isActive) {
                    linkClassName += ' sidebar__section-link--active'
                  }

                  if (isCompleted) {
                    linkClassName += ' sidebar__section-link--completed'
                  }

                  return (
                    <a
                      className={linkClassName}
                      href={`#${section.id}`}
                      key={section.id}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={() => handleSectionClick(section.id)}
                    >
                      <span className="sidebar__section-marker">
                        {isCompleted ? '✓' : ''}
                      </span>

                      <span>{section.title}</span>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <a href="#about">О проекте</a>
      </div>
    </aside>
  )
}

export default Sidebar