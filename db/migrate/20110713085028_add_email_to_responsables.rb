class AddEmailToResponsables < ActiveRecord::Migration
  def self.up
    add_column :responsables, :email, :string
  end

  def self.down
    remove_column :responsables, :email
  end
end
