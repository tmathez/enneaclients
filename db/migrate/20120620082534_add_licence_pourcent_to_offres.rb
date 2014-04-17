class AddLicencePourcentToOffres < ActiveRecord::Migration
  def change
    add_column :offres, :licence_pourcent, :float
  end
end
