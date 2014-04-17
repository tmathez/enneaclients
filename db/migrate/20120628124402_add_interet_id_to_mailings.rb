class AddInteretIdToMailings < ActiveRecord::Migration
  def change
    add_column :mailings, :interet_id, :integer
  end
end