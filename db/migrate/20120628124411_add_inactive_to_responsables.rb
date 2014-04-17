class AddInactiveToResponsables < ActiveRecord::Migration
  def change
    add_column :responsables, :inactive, :boolean
  end
end