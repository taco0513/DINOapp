// Batch update script for adding es and fr to all translations
// This adds Spanish and French translations to missing entries

const batchUpdates = {
  'common.days': {
    es: 'días',
    fr: 'jours',
  },
  'common.total': {
    es: 'Total',
    fr: 'Total',
  },
  'language.select': {
    es: 'Idioma',
    fr: 'Langue',
  },
  'dashboard.stats.countries': {
    es: 'Países Visitados',
    fr: 'Pays Visités',
  },
  'dashboard.stats.view': {
    es: 'Ver Estadísticas',
    fr: 'Voir les Statistiques',
  },
  'dashboard.recent_activity': {
    es: 'Actividad Reciente',
    fr: 'Activité Récente',
  },
  'dashboard.no_trips': {
    es: 'Aún no hay registros de viaje',
    fr: "Pas encore d'enregistrements de voyage",
  },
  'dashboard.add_first_trip': {
    es: 'Añadir tu primer viaje',
    fr: 'Ajouter votre premier voyage',
  },
  'dashboard.loading_activity': {
    es: 'Cargando actividad reciente...',
    fr: "Chargement de l'activité récente...",
  },
  'trips.title': {
    es: 'Registros de Viaje',
    fr: 'Enregistrements de Voyage',
  },
  'trips.description': {
    es: 'Añade y gestiona tus registros de viaje',
    fr: 'Ajoutez et gérez vos enregistrements de voyage',
  },
  'trips.add': {
    es: 'Añadir Nuevo Viaje',
    fr: 'Ajouter un Nouveau Voyage',
  },
  'trips.empty': {
    es: 'No se encontraron registros de viaje',
    fr: 'Aucun enregistrement de voyage trouvé',
  },
  'trips.loading': {
    es: 'Cargando viajes...',
    fr: 'Chargement des voyages...',
  },
  'schengen.title': {
    es: 'Calculadora Schengen',
    fr: 'Calculateur Schengen',
  },
  'schengen.description': {
    es: 'Verifica la regla 90/180 días y rastrea el cumplimiento',
    fr: 'Vérifiez la règle 90/180 jours et suivez la conformité',
  },
  'schengen.used_days': {
    es: 'Días Utilizados',
    fr: 'Jours Utilisés',
  },
  'schengen.compliant': {
    es: '✅ Cumple con Schengen',
    fr: '✅ Conforme Schengen',
  },
  'schengen.violation': {
    es: '⚠️ Violación Schengen',
    fr: '⚠️ Violation Schengen',
  },
  'form.country': {
    es: 'País',
    fr: 'Pays',
  },
  'form.entry_date': {
    es: 'Fecha de Entrada',
    fr: "Date d'Entrée",
  },
  'form.exit_date': {
    es: 'Fecha de Salida',
    fr: 'Date de Sortie',
  },
  'form.visa_type': {
    es: 'Tipo de Visa',
    fr: 'Type de Visa',
  },
  'form.save': {
    es: 'Guardar',
    fr: 'Enregistrer',
  },
  'form.cancel': {
    es: 'Cancelar',
    fr: 'Annuler',
  },
  'form.delete': {
    es: 'Eliminar',
    fr: 'Supprimer',
  },
  'form.edit': {
    es: 'Editar',
    fr: 'Modifier',
  },
  'notifications.title': {
    es: 'Notificaciones',
    fr: 'Notifications',
  },
  'notifications.empty': {
    es: 'No hay nuevas notificaciones',
    fr: 'Aucune nouvelle notification',
  },
  'notifications.view_all': {
    es: 'Ver Todo',
    fr: 'Tout Voir',
  },
};

export { batchUpdates };
