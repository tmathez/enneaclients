class CreateClients < ActiveRecord::Migration
  def self.up
    create_table :clients do |t|
      t.integer :numero
      t.date :date_commande
      t.string :nom
      t.string :rue
      t.string :npa
      t.string :lieu
      t.string :tel
      t.integer :nb_licences
      t.boolean :sorba
      t.boolean :enneasoft
      t.boolean :enneascanningSorba
      t.boolean :enneascanningPdf

      t.timestamps
    end
  end

  def self.down
    drop_table :clients
  end
end
