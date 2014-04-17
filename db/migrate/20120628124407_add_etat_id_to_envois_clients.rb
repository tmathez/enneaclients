class AddEtatIdToEnvoisClients < ActiveRecord::Migration
  def change
    add_column :envois_clients, :etat_id, :integer
  end
end