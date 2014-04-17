class RemoveNoContactFromClients < ActiveRecord::Migration
  def change
    remove_column :clients, :no_contact
  end
end
