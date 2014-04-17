class AddTexteRabaisToOffres < ActiveRecord::Migration
  def self.up
    add_column :offres, :texte_rabais, :string
  end

  def self.down
    remove_column :offres, :text_rabais
  end
end