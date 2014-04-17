class AddEnneascanningPdfBuildEnneascanningSorbaBuildToClients < ActiveRecord::Migration
  def self.up
    add_column :clients, :enneascanning_pdf_build, :datetime
    add_column :clients, :enneascanning_sorba_build, :datetime
  end

  def self.down
    remove_column :clients, :enneascanning_pdf_build
    remove_column :clients, :enneascanning_sorba_build
  end
end