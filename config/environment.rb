# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Enneaclients::Application.initialize!

# Ramplacement du wrapper 'div' en wrapper 'span' pour la gestion des erreurs
ActionView::Base.field_error_proc = Proc.new{ |html_tag, instance| "<span class='field_with_errors'>#{html_tag}</span>".html_safe }
