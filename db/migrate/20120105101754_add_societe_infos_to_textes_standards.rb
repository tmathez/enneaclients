class AddSocieteInfosToTextesStandards < ActiveRecord::Migration
  def self.up
    add_column :textes_standards, :rue, :string
    add_column :textes_standards, :cp, :string
    add_column :textes_standards, :npa, :string
    add_column :textes_standards, :lieu, :string
    add_column :textes_standards, :header_left, :text
    add_column :textes_standards, :header_center, :text
    add_column :textes_standards, :header_right, :text
    add_column :textes_standards, :footer_left, :text
    add_column :textes_standards, :footer_center, :text
    add_column :textes_standards, :footer_right, :text
  end

  def self.down
    remove_column :textes_standards, :rue
    remove_column :textes_standards, :cp
    remove_column :textes_standards, :npa
    remove_column :textes_standards, :lieu
    remove_column :textes_standards, :header_left
    remove_column :textes_standards, :header_center
    remove_column :textes_standards, :header_right
    remove_column :textes_standards, :footer_left
    remove_column :textes_standards, :footer_center
    remove_column :textes_standards, :footer_right
  end
end