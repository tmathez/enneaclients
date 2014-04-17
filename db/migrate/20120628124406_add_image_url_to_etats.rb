class AddImageUrlToEtats < ActiveRecord::Migration
  def change
    add_column :etats, :image_url, :string
  end
end