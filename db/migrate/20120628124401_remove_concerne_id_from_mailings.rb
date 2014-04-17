class RemoveConcerneIdFromMailings < ActiveRecord::Migration
  def change
    remove_column :mailings, :concerne_id
  end
end