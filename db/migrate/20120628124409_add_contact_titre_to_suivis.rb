class AddContactTitreToSuivis < ActiveRecord::Migration
  def change
    add_column :suivis, :contact_titre, :string
  end
end