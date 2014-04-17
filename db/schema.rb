# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120628124411) do

  create_table "catalogues", :force => true do |t|
    t.string   "nom"
    t.boolean  "membre"
    t.boolean  "analyses"
    t.float    "prix"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "clients", :force => true do |t|
    t.integer  "numero"
    t.date     "date_commande"
    t.string   "nom"
    t.string   "rue"
    t.string   "lieu"
    t.string   "tel"
    t.integer  "nb_licences"
    t.boolean  "sorba"
    t.boolean  "enneasoft"
    t.boolean  "enneascanningSorba"
    t.boolean  "enneascanningPdf"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "no_support"
    t.integer  "numero_enneasoft"
    t.boolean  "asp_client"
    t.integer  "version_sorba"
    t.integer  "version_esorba"
    t.float    "version_epdf"
    t.text     "autre"
    t.text     "remarques"
    t.boolean  "enneascanning_ts"
    t.boolean  "inactif"
    t.string   "serial"
    t.datetime "enneascanning_pdf_build"
    t.datetime "enneascanning_sorba_build"
    t.integer  "nb_licences_ts"
    t.string   "langue",                    :limit => 2
    t.boolean  "interesse"
    t.string   "contact_prenom"
    t.string   "contact_nom"
    t.string   "titre"
    t.string   "email"
    t.string   "web"
    t.string   "fax"
    t.string   "natel"
    t.string   "canton",                    :limit => 2
    t.integer  "npa"
  end

  add_index "clients", ["numero"], :name => "clients_nom_index"

  create_table "clients_interets", :force => true do |t|
    t.integer  "client_id"
    t.integer  "interet_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "clients_secteurs", :force => true do |t|
    t.integer  "client_id"
    t.integer  "secteur_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "concerne_mailings", :force => true do |t|
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "custom_services", :force => true do |t|
    t.string   "nom"
    t.text     "description"
    t.float    "prix_jour"
    t.float    "prix_heure"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "enneascanning_versions", :force => true do |t|
    t.string   "version"
    t.string   "app_name"
    t.datetime "build"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "envois", :force => true do |t|
    t.date     "date_envoi"
    t.string   "nom"
    t.text     "filtre"
    t.boolean  "termine"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "mailing_id"
  end

  create_table "envois_clients", :force => true do |t|
    t.integer  "client_id"
    t.integer  "envoi_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "etat_id",    :default => 1
    t.date     "last_suivi"
  end

  create_table "etats", :force => true do |t|
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image_url"
  end

  create_table "evenements", :force => true do |t|
    t.boolean  "resolu"
    t.text     "description"
    t.text     "solution"
    t.integer  "concerne"
    t.integer  "responsable_id"
    t.integer  "client_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.date     "date_evenement"
    t.time     "heure_evenement"
    t.string   "telephone",        :limit => nil
    t.float    "heures"
    t.float    "tarif"
    t.date     "date_facturation"
    t.integer  "facturation"
    t.integer  "tag_id"
  end

  create_table "interets", :force => true do |t|
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "licences", :force => true do |t|
    t.integer  "client_id"
    t.string   "poste_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "licences_logs", :force => true do |t|
    t.integer  "client_id"
    t.string   "poste_id"
    t.boolean  "granted"
    t.datetime "date_licence"
    t.string   "message"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "mailings", :force => true do |t|
    t.integer  "type_mailing_id"
    t.string   "nom"
    t.boolean  "termine"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "interet_id"
  end

  create_table "offres", :force => true do |t|
    t.integer  "client_id"
    t.string   "client_nom"
    t.string   "client_adresse"
    t.string   "client_npa"
    t.string   "client_lieu"
    t.string   "texte_string"
    t.string   "texte_installation"
    t.string   "texte_final"
    t.date     "date_offre"
    t.date     "date_valide"
    t.date     "date_installation"
    t.integer  "licences"
    t.float    "rabais_logiciel"
    t.float    "tva"
    t.boolean  "accepte"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "contrat_facultatif"
    t.float    "contrat"
    t.string   "client_reference"
    t.string   "contrat_nom"
    t.text     "contrat_description"
    t.integer  "societe_id"
    t.string   "texte_rabais"
    t.string   "client_tel"
    t.float    "licence_pourcent"
  end

  create_table "offres_catalogues", :force => true do |t|
    t.integer  "offre_id"
    t.integer  "catalogue_id"
    t.string   "nom"
    t.float    "prix"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "offres_modules", :force => true do |t|
    t.integer  "offre_id"
    t.integer  "module_id"
    t.string   "nom"
    t.text     "description"
    t.float    "prix"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "offres_services", :force => true do |t|
    t.integer  "offre_id"
    t.integer  "service_id"
    t.text     "description"
    t.float    "nb_jours"
    t.float    "nb_heures"
    t.float    "prix_jour"
    t.float    "prix_heure"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "responsables", :force => true do |t|
    t.string   "prenom"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email",      :limit => nil
    t.boolean  "inactive"
  end

  create_table "secteurs", :force => true do |t|
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "societes", :force => true do |t|
    t.string   "nom"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "client_id"
  end

  create_table "software_modules", :force => true do |t|
    t.string   "nom"
    t.text     "description"
    t.float    "prix"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "suivis", :force => true do |t|
    t.integer  "client_id"
    t.integer  "mailing_id"
    t.integer  "etat_id"
    t.date     "date_suivi"
    t.string   "contact_nom"
    t.string   "contact_prenom"
    t.text     "commentaire"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "contact_titre"
    t.date     "date_next_contact"
  end

  create_table "tags", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "textes_standards", :force => true do |t|
    t.integer  "societe_id"
    t.string   "texte_string"
    t.string   "texte_rabais"
    t.text     "texte_installation"
    t.text     "texte_final"
    t.string   "contrat_nom"
    t.text     "contrat_description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "rue"
    t.string   "cp"
    t.string   "npa"
    t.string   "lieu"
    t.text     "header_left"
    t.text     "header_center"
    t.text     "header_right"
    t.text     "footer_left"
    t.text     "footer_center"
    t.text     "footer_right"
  end

  create_table "type_mailings", :force => true do |t|
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
