class CreateTextesStandards < ActiveRecord::Migration
  def self.up
    create_table :textes_standards do |t|
      t.integer :societe_id
      t.integer :texte_id
      t.text :texte
      
      t.timestamps
    end
  end

  def self.down
    drop_table :textes_standards
  end
end