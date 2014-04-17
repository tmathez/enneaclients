class RemoveContactFromClients < ActiveRecord::Migration
  def change
    remove_column :clients, :contact
  end
end