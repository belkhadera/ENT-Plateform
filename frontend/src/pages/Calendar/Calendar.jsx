// src/pages/Calendar/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  BookOpen,
  FileText,
  Bell,
  Search,
  Filter,
  Download,
  Share2,
  MoreVertical
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import './Calendar.css';

const Calendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    loadEvents();
  }, [user, navigate]);

  const loadEvents = () => {
    // Simulation de chargement des événements
    const mockEvents = [
      {
        id: 1,
        title: 'Cours de Développement Web',
        type: 'cours',
        date: '2024-03-25',
        time: '09:00 - 11:00',
        location: 'Salle 203',
        professor: 'Pr. Benali',
        description: 'Cours sur React.js avancé',
        color: '#1967d2'
      },
      {
        id: 2,
        title: 'TP Algorithmique',
        type: 'tp',
        date: '2024-03-25',
        time: '14:00 - 16:00',
        location: 'Labo 105',
        professor: 'Pr. Alaoui',
        description: 'Exercices sur les algorithmes de tri',
        color: '#137333'
      },
      {
        id: 3,
        title: 'Rendu projet Web',
        type: 'deadline',
        date: '2024-03-26',
        time: '23:59',
        description: 'Date limite de rendu du projet React',
        color: '#b45309'
      },
      {
        id: 4,
        title: 'Examen Base de données',
        type: 'examen',
        date: '2024-03-28',
        time: '09:00 - 12:00',
        location: 'Amphi A',
        professor: 'Pr. Idrissi',
        description: 'Examen final de bases de données',
        color: '#7c3aed'
      },
      {
        id: 5,
        title: 'Soutenance de stage',
        type: 'soutenance',
        date: '2024-03-29',
        time: '14:00',
        location: 'Salle de conférence',
        professor: 'Pr. Benjelloun',
        description: 'Soutenance des stages S5',
        color: '#d32f2f'
      },
      {
        id: 6,
        title: 'Réunion pédagogique',
        type: 'reunion',
        date: '2024-03-27',
        time: '10:00 - 11:30',
        location: 'Salle des professeurs',
        description: 'Réunion du département informatique',
        color: '#f57c00'
      }
    ];
    setEvents(mockEvents);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getRoleIcon = () => {
    switch(user?.role) {
      case 'etudiant': return '👨‍🎓';
      case 'enseignant': return '👨‍🏫';
      case 'admin': return '👨‍💼';
      default: return '👤';
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Jours vides avant le premier jour du mois
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <span className="day-number">{day}</span>
          {dateEvents.length > 0 && (
            <div className="day-events">
              {dateEvents.slice(0, 2).map((event, index) => (
                <div
                  key={index}
                  className="day-event"
                  style={{ backgroundColor: event.color }}
                  title={event.title}
                ></div>
              ))}
              {dateEvents.length > 2 && (
                <span className="more-events">+{dateEvents.length - 2}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (!user) return null;

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="app">
      <Sidebar />
      
      <main className="main-content-with-sidebar">
        {/* Top Navigation */}
        <nav className="top-nav">
          <div className="nav-left">
            <div className="logo">
              <img src="/logo.png" alt="EST" />
              <span>EST Salé</span>
            </div>
          </div>

          <div className="nav-right">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Rechercher un événement..." />
            </div>

            <button className="notif-btn">
              <Bell size={20} />
              <span className="notif-dot"></span>
            </button>

            <div className="user-menu">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">
                  {getRoleIcon()} {user?.role === 'etudiant' ? 'Étudiant' : 
                   user?.role === 'enseignant' ? 'Enseignant' : 'Administrateur'}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          {/* Header Section */}
          <div className="content-header">
            <div>
              <h1 className="page-title">Calendrier</h1>
              <p className="page-subtitle">
                {getRoleIcon()} Gérez votre emploi du temps et vos événements
              </p>
            </div>
            
            <div className="calendar-actions">
              <div className="view-mode">
                <button
                  className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                  onClick={() => setViewMode('month')}
                >
                  Mois
                </button>
                <button
                  className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
                  onClick={() => setViewMode('week')}
                >
                  Semaine
                </button>
                <button
                  className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
                  onClick={() => setViewMode('day')}
                >
                  Jour
                </button>
              </div>
              
              <button className="add-event-btn" onClick={() => setShowEventModal(true)}>
                <Plus size={18} />
                <span>Nouvel événement</span>
              </button>
            </div>
          </div>

          {/* Calendar Container */}
          <div className="calendar-container">
            {/* Calendar Header */}
            <div className="calendar-header">
              <div className="calendar-nav">
                <button className="nav-btn" onClick={() => changeMonth(-1)}>
                  <ChevronLeft size={20} />
                </button>
                <h2 className="current-month">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button className="nav-btn" onClick={() => changeMonth(1)}>
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <button className="today-btn" onClick={() => setCurrentDate(new Date())}>
                Aujourd'hui
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Day names */}
              {dayNames.map((day, index) => (
                <div key={index} className="calendar-day-name">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#1967d2' }}></span>
                <span>Cours</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#137333' }}></span>
                <span>TP</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#b45309' }}></span>
                <span>Deadline</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#7c3aed' }}></span>
                <span>Examen</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#d32f2f' }}></span>
                <span>Soutenance</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#f57c00' }}></span>
                <span>Réunion</span>
              </div>
            </div>
          </div>

          {/* Events of the day */}
          <div className="day-events-section">
            <h3 className="section-title">
              Événements du {selectedDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </h3>

            <div className="events-list">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className="event-card"
                    style={{ borderLeftColor: event.color }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="event-time">
                      <Clock size={14} />
                      <span>{event.time}</span>
                    </div>
                    <h4 className="event-title">{event.title}</h4>
                    {event.location && (
                      <div className="event-location">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.professor && (
                      <div className="event-professor">
                        <User size={14} />
                        <span>{event.professor}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-events">
                  <CalendarIcon size={48} />
                  <p>Aucun événement prévu pour cette journée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;