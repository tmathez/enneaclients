class RemoveDateMailingFiltreFromMailings < ActiveRecord::Migration
  def change
    remove_column :mailings, :date_mailing
    remove_column :mailings, :filtre
  end
end