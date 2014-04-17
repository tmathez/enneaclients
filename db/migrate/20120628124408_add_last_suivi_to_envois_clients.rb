class AddLastSuiviToEnvoisClients < ActiveRecord::Migration
  def change
    add_column :envois_clients, :last_suivi, :date
  end
end