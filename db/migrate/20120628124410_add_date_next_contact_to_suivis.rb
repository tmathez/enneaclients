class AddDateNextContactToSuivis < ActiveRecord::Migration
  def change
    add_column :suivis, :date_next_contact, :date
  end
end